"use client";

import React, { useState } from "react";
import Stepper from "@/components/Stepper";
import Step1 from "@/components/Step1";
import Step2 from "@/components/Step2";
import Step3 from "@/components/Step3";

export default function Page() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    email: "",
    gender: "",
    address: "",
    city: "",
    country: "",
    dateOfBirthBS: "",
    dateOfBirthAD: "",
    // Step 2
    citizenshipNumber: "",
    issuedDistrict: "",
    issuedDateBS: "",
    issuedDateAD: "",
    frontFilePreview: "",
    backFilePreview: "",
  });

  const steps = ["Personal Info", "Citizenship Info", "Confirmation"];

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    console.log("Form submitted successfully:", formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <Stepper steps={steps} currentStep={currentStep} />

      <div className="mt-6">
        {currentStep === 0 && (
          <Step1 onNext={handleNext} defaultValues={formData} />
        )}
        {currentStep === 1 && (
          <Step2
            onNext={handleNext}
            onBack={handleBack}
            defaultValues={formData}
          />
        )}
        {currentStep === 2 && (
          <Step3
            data={formData}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
