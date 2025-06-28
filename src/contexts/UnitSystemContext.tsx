import React, { createContext, useContext, useState, useEffect } from 'react';

type UnitSystem = 'imperial' | 'metric';

interface UnitSystemContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  convertLength: (value: number, to?: UnitSystem) => number;
  formatLength: (value: number, to?: UnitSystem) => string;
  convertArea: (value: number, to?: UnitSystem) => number;
  formatArea: (value: number, to?: UnitSystem) => string;
  convertVolume: (value: number, to?: UnitSystem) => number;
  formatVolume: (value: number, to?: UnitSystem) => string;
  convertWeight: (value: number, to?: UnitSystem) => number;
  formatWeight: (value: number, to?: UnitSystem) => string;
}

const UnitSystemContext = createContext<UnitSystemContextType | undefined>(undefined);

export const useUnitSystem = () => {
  const context = useContext(UnitSystemContext);
  if (context === undefined) {
    throw new Error('useUnitSystem must be used within a UnitSystemProvider');
  }
  return context;
};

export const UnitSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the saved preference or default to metric
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem('unitSystem');
    return (saved as UnitSystem) || 'metric';
  });

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('unitSystem', unitSystem);
  }, [unitSystem]);

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
  };

  // Conversion functions
  const convertLength = (value: number, to?: UnitSystem): number => {
    const targetSystem = to || unitSystem;
    if (targetSystem === 'metric') {
      // Convert from inches to cm
      return value * 2.54;
    } else {
      // Convert from cm to inches
      return value / 2.54;
    }
  };

  const formatLength = (value: number, to?: UnitSystem): string => {
    const targetSystem = to || unitSystem;
    if (targetSystem === 'metric') {
      const cm = convertLength(value, 'metric');
      return `${cm.toFixed(1)} cm`;
    } else {
      // For imperial, keep as is (assuming input is in inches)
      return `${value.toFixed(1)}"`;
    }
  };

  const convertArea = (value: number, to?: UnitSystem): number => {
    const targetSystem = to || unitSystem;
    if (targetSystem === 'metric') {
      // Convert from sq ft to sq m
      return value * 0.092903;
    } else {
      // Convert from sq m to sq ft
      return value / 0.092903;
    }
  };

  const formatArea = (value: number, to?: UnitSystem): string => {
    const targetSystem = to || unitSystem;
    if (targetSystem === 'metric') {
      const sqm = convertArea(value, 'metric');
      return `${sqm.toFixed(2)} m²`;
    } else {
      // For imperial, keep as is (assuming input is in sq ft)
      return `${value.toFixed(2)} ft²`;
    }
  };

  const convertVolume = (value: number, to?: UnitSystem): number => {
    const targetSystem = to || unitSystem;
    if (targetSystem === 'metric') {
      // Convert from cubic ft to cubic m
      return value * 0.0283168;
    } else {
      // Convert from cubic m to cubic ft
      return value / 0.0283168;
    }
  };

  const formatVolume = (value: number, to?: UnitSystem): string => {
    const targetSystem = to || unitSystem;
    if (targetSystem === 'metric') {
      const cubicM = convertVolume(value, 'metric');
      return `${cubicM.toFixed(2)} m³`;
    } else {
      // For imperial, keep as is (assuming input is in cubic ft)
      return `${value.toFixed(2)} ft³`;
    }
  };

  const convertWeight = (value: number, to?: UnitSystem): number => {
    const targetSystem = to || unitSystem;
    if (targetSystem === 'metric') {
      // Convert from lb to kg
      return value * 0.453592;
    } else {
      // Convert from kg to lb
      return value / 0.453592;
    }
  };

  const formatWeight = (value: number, to?: UnitSystem): string => {
    const targetSystem = to || unitSystem;
    if (targetSystem === 'metric') {
      const kg = convertWeight(value, 'metric');
      return `${kg.toFixed(2)} kg`;
    } else {
      // For imperial, keep as is (assuming input is in lb)
      return `${value.toFixed(2)} lb`;
    }
  };

  const value = {
    unitSystem,
    setUnitSystem,
    convertLength,
    formatLength,
    convertArea,
    formatArea,
    convertVolume,
    formatVolume,
    convertWeight,
    formatWeight
  };

  return (
    <UnitSystemContext.Provider value={value}>
      {children}
    </UnitSystemContext.Provider>
  );
};