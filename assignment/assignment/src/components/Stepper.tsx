"use client";

import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto px-4">
      {/* Progress Line */}
      <div className="absolute top-4 left-0 w-full h-[3px] bg-gray-300 z-0" />
      <div
        className="absolute top-4 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 z-0 transition-all duration-500"
        style={{
          width: `${(currentStep / (steps.length - 1)) * 100}%`,
        }}
      />

      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div
            key={index}
            className="relative z-10 flex flex-col items-center w-full group"
          >
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 
                ${isCompleted ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-lg" : ""}
                ${isActive && !isCompleted ? "border-blue-500 text-blue-500 font-bold shadow-md" : ""}
                ${!isCompleted && !isActive ? "border-gray-300 text-gray-500" : ""}
                group-hover:scale-105`}
            >
              {isCompleted ? "✓" : index + 1}
            </div>

            {/* Step Label */}
            <p
              className={`mt-2 text-sm transition-all duration-300 
                ${isActive ? "font-semibold text-blue-600" : isCompleted ? "text-gray-700" : "text-gray-500"}`}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}
