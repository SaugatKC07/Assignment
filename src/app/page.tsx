"use client";

import React, { useState } from "react";
import Step1 from "@/components/Step1";
import Step2 from "@/components/Step2";
import Step3 from "@/components/Step3";
import { FormData } from "@/types";

export default function Page() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({});

  const steps: string[] = ["Personal Info", "Additional Info", "Review & Submit"];

  const handleNext = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitFinal = () => {
    console.log("Form submitted successfully");
    console.log(formData);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded space-y-6">
      {/* Stepper Header */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`mt-2 text-sm ${
                index === currentStep
                  ? "font-bold text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {step}
            </p>
          </div>
        ))}
      </div>

      {/* Step Forms */}
      {currentStep === 0 && (
        <Step1 onNext={handleNext} defaultValues={formData} />
      )}
      {currentStep === 1 && (
        <Step2 onNext={handleNext} onBack={handleBack} defaultValues={formData} />
      )}
      {currentStep === 2 && (
        <Step3 data={formData} onBack={handleBack} onSubmit={handleSubmitFinal} />
      )}
    </div>
  );
}
