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
import nepalify from "nepalify";

// ✅ Validation schema
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
  const isSyncing = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const dobBS = watch("dobBS");
  const dobAD = watch("dobAD");
  const fullNameEnglish = watch("fullNameEnglish");

  // Auto-fill Nepali name
  useEffect(() => {
    if (fullNameEnglish) {
      setValue("fullNameNepali", nepalify.format(fullNameEnglish, { lang: "ne" }));
    }
  }, [fullNameEnglish, setValue]);

  // Age calculator
  const calculateAge = (adDate: Date) => {
    const today = new Date();
    let years = today.getFullYear() - adDate.getFullYear();
    const m = today.getMonth() - adDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < adDate.getDate())) {
      years--;
    }
    setAge(years);
    setValue("age", years);
  };

  // BS → AD conversion
  useEffect(() => {
    if (!dobBS || isSyncing.current) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dobBS)) return;
    try {
      isSyncing.current = true;
      const [bsYear, bsMonthStr, bsDayStr] = dobBS.split("-");
      const nepDate = new NepaliDate(Number(bsYear), Number(bsMonthStr) - 1, Number(bsDayStr));
      const adJs = nepDate.toJsDate();
      const formattedAD = `${adJs.getFullYear()}-${String(adJs.getMonth() + 1).padStart(2, "0")}-${String(adJs.getDate()).padStart(2, "0")}`;
      setValue("dobAD", formattedAD, { shouldValidate: true, shouldDirty: true });
      calculateAge(adJs);
      clearErrors("dobBS");
    } catch (err) {
      console.error("BS → AD conversion error:", err);
      setError("dobBS", { message: "Invalid BS date" });
    } finally {
      setTimeout(() => (isSyncing.current = false), 0);
    }
  }, [dobBS, setValue, clearErrors, setError]);

  // AD → BS conversion
  useEffect(() => {
    if (!dobAD || isSyncing.current) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dobAD)) return;
    try {
      isSyncing.current = true;
      const [adYear, adMonthStr, adDayStr] = dobAD.split("-");
      const adJs = new Date(Number(adYear), Number(adMonthStr) - 1, Number(adDayStr));
      const nepDate = new NepaliDate(adJs); // From AD
      const bs = nepDate.getBS(); // { year, month, date }
      const formattedBS = `${bs.year}-${String(bs.month + 1).padStart(2, "0")}-${String(bs.date).padStart(2, "0")}`;
      setValue("dobBS", formattedBS, { shouldValidate: true, shouldDirty: true });
      calculateAge(adJs);
      clearErrors("dobAD");
    } catch (err) {
      console.error("AD → BS conversion error:", err);
      setError("dobAD", { message: "Invalid AD date" });
    } finally {
      setTimeout(() => (isSyncing.current = false), 0);
    }
  }, [dobAD, setValue, clearErrors, setError]);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div>
        <label>Full Name (English)</label>
        <Input {...register("fullNameEnglish")} />
        {errors.fullNameEnglish && <p className="text-red-500">{errors.fullNameEnglish.message}</p>}
      </div>

      <div>
        <label>Full Name (Nepali)</label>
        <Input
          {...register("fullNameNepali", {
            onChange: (e) => {
              setValue("fullNameNepali", nepalify.format(e.target.value, { lang: "ne" }), {
                shouldValidate: true,
                shouldDirty: true,
              });
            },
          })}
          placeholder="नाम (नेपाली)"
        />
      </div>

      <div>
        <label>Gender</label>
        <Select
          onValueChange={(val) => setValue("gender", val as any, { shouldValidate: true, shouldDirty: true })}
          value={watch("gender") || ""}
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
        {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
      </div>

      <div>
        <label>Date of Birth (BS)</label>
        <Input type="date" {...register("dobBS")} />
        {errors.dobBS && <p className="text-red-500">{errors.dobBS.message}</p>}
      </div>

      <div>
        <label>Date of Birth (AD)</label>
        <Input type="date" {...register("dobAD")} />
        {errors.dobAD && <p className="text-red-500">{errors.dobAD.message}</p>}
      </div>

      {age !== null && <p>Calculated Age: {age} years</p>}

      <div>
        <label>Phone Number</label>
        <Input {...register("phone")} placeholder="98XXXXXXXX" />
        {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
      </div>

      <Button type="submit" disabled={!isValid}>
        Continue
      </Button>
    </form>
  );
}
