"use client";

import React, { useState, useEffect } from "react";
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
import DateConverter from "nepali-date-converter"; // ✅ Added

// Validation schema
const schema = z
  .object({
    fullNameEnglish: z
      .string()
      .min(2, "Full name is required")
      .regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed"),
    fullNameNepali: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"], {
      required_error: "Gender is required",
    }),
    dobBS: z.string().min(1, "DOB (BS) is required"),
    dobAD: z.string().min(1, "DOB (AD) is required"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || (/^9\d{9}$/.test(val) && val.length === 10),
        "Phone must start with 9 and be exactly 10 digits"
      ),
    age: z.number().optional(),
  })
  .refine(
    (data) =>
      !(data.age && data.age > 18 && data.gender === "Male" && !data.phone),
    { message: "Phone is required for male above 18", path: ["phone"] }
  );

type FormData = z.infer<typeof schema>;

export default function Step1({
  onNext,
  defaultValues,
}: {
  onNext: (data: FormData) => void;
  defaultValues?: Partial<FormData>;
}) {
  const [age, setAge] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const gender = watch("gender");
  const dobBS = watch("dobBS");
  const dobAD = watch("dobAD");

  const calculateAge = (date: Date) => {
    const today = new Date();
    let years = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      years--;
    }
    setAge(years);
    setValue("age", years, { shouldValidate: true });
  };

  // ✅ BS → AD conversion using nepali-date-converter
  useEffect(() => {
    if (!dobBS) return;
    try {
      const [bsYear, bsMonth = "01", bsDay = "01"] = dobBS
        .split("-")
        .map(Number);
      const ad = new DateConverter(bsYear, bsMonth, bsDay, "BS").toAd();
      const formattedAD = `${ad.year}-${String(ad.month).padStart(
        2,
        "0"
      )}-${String(ad.date).padStart(2, "0")}`;
      setValue("dobAD", formattedAD, { shouldValidate: true });
      calculateAge(new Date(formattedAD));
      clearErrors("dobBS");
    } catch {
      setError("dobBS", { message: "Invalid BS date" });
    }
  }, [dobBS]);

  // ✅ AD → BS conversion using nepali-date-converter
  useEffect(() => {
    if (!dobAD) return;
    try {
      const [adYear, adMonth = "01", adDay = "01"] = dobAD
        .split("-")
        .map(Number);
      const bs = new DateConverter(adYear, adMonth, adDay, "AD").toBs();
      const formattedBS = `${bs.year}-${String(bs.month).padStart(
        2,
        "0"
      )}-${String(bs.date).padStart(2, "0")}`;
      setValue("dobBS", formattedBS, { shouldValidate: true });
      calculateAge(new Date(dobAD));
      clearErrors("dobAD");
    } catch {
      setError("dobAD", { message: "Invalid AD date" });
    }
  }, [dobAD]);

  const handleNepaliInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      target.value =
        target.value.substring(0, start) + " " + target.value.substring(end);
      target.setSelectionRange(start + 1, start + 1);
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      {/* Full Name English */}
      <div>
        <label className="block mb-1">Full Name (English)</label>
        <Input {...register("fullNameEnglish")} />
        {errors.fullNameEnglish && (
          <p className="text-red-500 text-sm">
            {errors.fullNameEnglish.message}
          </p>
        )}
      </div>

      {/* Full Name Nepali */}
      <div>
        <label className="block mb-1">Full Name (Nepali)</label>
        <Input
          {...register("fullNameNepali")}
          onKeyDown={handleNepaliInput}
          placeholder="नेपालीमा टाइप गर्नुहोस्"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block mb-1">Gender</label>
        <Select
          onValueChange={(val) =>
            setValue("gender", val as any, { shouldValidate: true })
          }
          value={gender || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && (
          <p className="text-red-500 text-sm">{errors.gender.message}</p>
        )}
      </div>

      {/* DOB BS */}
      <div>
        <label className="block mb-1">Date of Birth (BS)</label>
        <Input type="date" {...register("dobBS")} />
        {errors.dobBS && (
          <p className="text-red-500 text-sm">{errors.dobBS.message}</p>
        )}
      </div>

      {/* DOB AD */}
      <div>
        <label className="block mb-1">Date of Birth (AD)</label>
        <Input type="date" {...register("dobAD")} />
        {errors.dobAD && (
          <p className="text-red-500 text-sm">{errors.dobAD.message}</p>
        )}
      </div>

      {/* Age */}
      {age !== null && (
        <p className="text-sm text-gray-700">Calculated Age: {age}</p>
      )}

      {/* Phone */}
      <div>
        <label className="block mb-1">Phone Number</label>
        <Input {...register("phone")} placeholder="98XXXXXXXX" />
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" disabled={!isValid}>
        Continue
      </Button>
    </form>
  );
}