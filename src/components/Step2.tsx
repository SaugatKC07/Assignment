"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import NepaliDate from "nepali-date-converter";

const districts = [
  "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara", "Bardiya",
  "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang", "Darchula", "Dhading", "Dhankuta",
  "Dhanusha", "Dolakha", "Dolpa", "Doti", "Eastern Rukum", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot",
  "Jhapa", "Jumla", "Kailali", "Kalikot", "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu", "Kavrepalanchok",
  "Khotang", "Lalitpur", "Lamjung", "Mahottari", "Makwanpur", "Manang", "Morang", "Mugu", "Mustang", "Myagdi",
  "Nawalpur", "Nuwakot", "Okhaldhunga", "Palpa", "Panchthar", "Parbat", "Parsa", "Pyuthan", "Ramechhap",
  "Rasuwa", "Rautahat", "Rolpa", "Rupandehi", "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli",
  "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari", "Surkhet", "Syangja", "Tanahun", "Taplejung", "Terhathum",
  "Udayapur", "Western Rukum"
];

const fileSchema = z
  .custom<File>((file) => file instanceof File, "File is required")
  .refine((file) => file && file.size <= 2 * 1024 * 1024, "File size must be less than 2MB")
  .refine(
    (file) => file && ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
    "Only JPG, PNG, or PDF allowed"
  );

const schema = z.object({
  citizenshipNumber: z.string().min(1, "Citizenship number is required"),
  issuedDistrict: z.string().min(1, "Issued district is required"),
  issuedDateBS: z.string().min(1, "Issued date (BS) is required"),
  issuedDateAD: z.string().min(1, "Issued date (AD) is required"),
  frontFile: fileSchema,
  backFile: fileSchema,
});

type FormData = z.infer<typeof schema>;

export default function Step2({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: FormData) => void;
  onBack: () => void;
  defaultValues?: Partial<FormData>;
}) {
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const isSyncing = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const issuedBS = watch("issuedDateBS");
  const issuedAD = watch("issuedDateAD");

  // Helper: parses either YYYY-MM-DD or MM/DD/YYYY
  function parseDateString(dateStr: string) {
    if (!dateStr) return null;
    if (dateStr.includes("/")) {
      const [month, day, year] = dateStr.split("/").map(Number);
      return { year, month, day };
    } else if (dateStr.includes("-")) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return { year, month, day };
    }
    return null;
  }

  // BS → AD
  useEffect(() => {
    if (!issuedBS || isSyncing.current) return;
    const parsed = parseDateString(issuedBS);
    if (!parsed) return;

    try {
      isSyncing.current = true;
      const nepDate = NepaliDate.fromBS({
        year: parsed.year,
        month: parsed.month - 1,
        date: parsed.day,
      });

      const adDate = nepDate.toAD();
      const adStr = `${adDate.getFullYear()}-${String(adDate.getMonth() + 1).padStart(2, "0")}-${String(
        adDate.getDate()
      ).padStart(2, "0")}`;

      if (adStr !== issuedAD) {
        setValue("issuedDateAD", adStr, { shouldValidate: true });
      }
    } catch (err) {
      console.error("BS → AD conversion error:", err);
    } finally {
      setTimeout(() => (isSyncing.current = false), 0);
    }
  }, [issuedBS]);

  // AD → BS
  useEffect(() => {
    if (!issuedAD || isSyncing.current) return;
    const parsed = parseDateString(issuedAD);
    if (!parsed) return;

    try {
      isSyncing.current = true;
      const adJs = new Date(parsed.year, parsed.month - 1, parsed.day);
      const nepDate = NepaliDate.fromAD(adJs);
      const bs = nepDate.getBS();

      const bsStr = `${bs.year}-${String(bs.month + 1).padStart(2, "0")}-${String(bs.date).padStart(2, "0")}`;

      if (bsStr !== issuedBS) {
        setValue("issuedDateBS", bsStr, { shouldValidate: true });
      }
    } catch (err) {
      console.error("AD → BS conversion error:", err);
    } finally {
      setTimeout(() => (isSyncing.current = false), 0);
    }
  }, [issuedAD]);

  const toBase64 = (file: File, setPreview: (val: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (val: string) => void,
    field: "frontFile" | "backFile"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(field, file, { shouldValidate: true });
      toBase64(file, setPreview);
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      {/* Citizenship Number */}
      <div>
        <label className="block mb-1">Citizenship Number</label>
        <Input {...register("citizenshipNumber")} />
        {errors.citizenshipNumber && (
          <p className="text-red-500 text-sm">{errors.citizenshipNumber.message}</p>
        )}
      </div>

      {/* Issued District */}
      <div>
        <label className="block mb-1">Issued District</label>
        <Select
          onValueChange={(val) => setValue("issuedDistrict", val, { shouldValidate: true })}
          value={watch("issuedDistrict") || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select District" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.issuedDistrict && (
          <p className="text-red-500 text-sm">{errors.issuedDistrict.message}</p>
        )}
      </div>

      {/* Issued Date BS */}
      <div>
        <label className="block mb-1">Issued Date (BS)</label>
        <Input type="date" {...register("issuedDateBS")} />
        {errors.issuedDateBS && (
          <p className="text-red-500 text-sm">{errors.issuedDateBS.message}</p>
        )}
      </div>

      {/* Issued Date AD */}
      <div>
        <label className="block mb-1">Issued Date (AD)</label>
        <Input type="date" {...register("issuedDateAD")} />
        {errors.issuedDateAD && (
          <p className="text-red-500 text-sm">{errors.issuedDateAD.message}</p>
        )}
      </div>

      {/* Citizenship Front */}
      <div>
        <label className="block mb-1">Upload Citizenship Front</label>
        <Input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => handleFileChange(e, setFrontPreview, "frontFile")}
        />
        {frontPreview && (
          <div className="mt-2">
            {frontPreview.startsWith("data:image") ? (
              <img src={frontPreview} alt="Preview" className="max-w-xs border" />
            ) : (
              <p>PDF file selected</p>
            )}
          </div>
        )}
        {errors.frontFile && (
          <p className="text-red-500 text-sm">{errors.frontFile.message as string}</p>
        )}
      </div>

      {/* Citizenship Back */}
      <div>
        <label className="block mb-1">Upload Citizenship Back</label>
        <Input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => handleFileChange(e, setBackPreview, "backFile")}
        />
        {backPreview && (
          <div className="mt-2">
            {backPreview.startsWith("data:image") ? (
              <img src={backPreview} alt="Preview" className="max-w-xs border" />
            ) : (
              <p>PDF file selected</p>
            )}
          </div>
        )}
        {errors.backFile && (
          <p className="text-red-500 text-sm">{errors.backFile.message as string}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button type="submit" disabled={!isValid}>
          Next
        </Button>
      </div>
    </form>
  );
}
