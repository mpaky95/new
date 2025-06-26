/**
 * Formula Evaluator for Parametric Cabinet Design
 * 
 * This utility provides functions to safely evaluate mathematical formulas
 * for cabinet part dimensions based on provided variables.
 */

// Define allowed mathematical operators and functions
const ALLOWED_OPERATORS = ['+', '-', '*', '/', '(', ')', '.'];
const ALLOWED_FUNCTIONS = ['min', 'max', 'round', 'floor', 'ceil'];

/**
 * Validates a formula string to ensure it only contains allowed operators,
 * functions, variables, and numeric values.
 * 
 * @param {string} formula - The formula string to validate
 * @param {Object} variables - Object containing variable names and values
 * @returns {boolean} - True if the formula is valid, false otherwise
 */
export const validateFormula = (formula, variables) => {
  if (!formula || typeof formula !== 'string') {
    return false;
  }

  // Remove all whitespace
  const cleanFormula = formula.replace(/\s+/g, '');
  
  // Check for empty formula
  if (cleanFormula.length === 0) {
    return false;
  }
  
  // Create a regex pattern for allowed variables
  const variableNames = Object.keys(variables);
  const variablePattern = variableNames.length > 0 ? 
    new RegExp(`(${variableNames.join('|')})`, 'g') : 
    /^$/; // Empty regex that won't match anything if no variables
  
  // Create a regex pattern for allowed functions
  const functionPattern = ALLOWED_FUNCTIONS.length > 0 ? 
    new RegExp(`(${ALLOWED_FUNCTIONS.join('|')})\\(`, 'g') : 
    /^$/;
  
  // Replace all variables and functions with placeholders
  let testFormula = cleanFormula;
  testFormula = testFormula.replace(variablePattern, 'V');
  testFormula = testFormula.replace(functionPattern, 'F(');
  
  // Replace all numbers with a placeholder
  testFormula = testFormula.replace(/\d+(\.\d+)?/g, 'N');
  
  // Now the formula should only contain allowed operators and placeholders
  // Check each character
  for (let i = 0; i < testFormula.length; i++) {
    const char = testFormula[i];
    if (char !== 'V' && char !== 'N' && char !== 'F' && !ALLOWED_OPERATORS.includes(char)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Evaluates a mathematical formula string using the provided variables.
 * 
 * @param {string} formula - The formula string to evaluate (e.g., "W - 2*T")
 * @param {Object} variables - Object containing variable names and values (e.g., {W: 24, T: 0.75})
 * @returns {number} - The calculated result
 * @throws {Error} - If the formula is invalid or evaluation fails
 */
export const evaluateFormula = (formula, variables) => {
  // Validate the formula first
  if (!validateFormula(formula, variables)) {
    throw new Error(`Invalid formula: ${formula}`);
  }
  
  try {
    // Create a safe evaluation context with only the provided variables
    // and allowed mathematical functions
    const context = { ...variables };
    
    // Add allowed mathematical functions
    context.min = Math.min;
    context.max = Math.max;
    context.round = Math.round;
    context.floor = Math.floor;
    context.ceil = Math.ceil;
    
    // Create a function that evaluates the formula in the context
    // This uses Function constructor which is safer than eval() but still needs
    // the validation we did above
    const paramNames = Object.keys(context);
    const paramValues = Object.values(context);
    
    // Create a function with the formula as its body
    const evalFunction = new Function(...paramNames, `return ${formula};`);
    
    // Execute the function with the variable values
    const result = evalFunction(...paramValues);
    
    // Ensure the result is a number
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      throw new Error(`Formula evaluation did not produce a valid number: ${formula}`);
    }
    
    return result;
  } catch (error) {
    throw new Error(`Error evaluating formula "${formula}": ${error.message}`);
  }
};

/**
 * Evaluates all dimensions for a cabinet part based on formulas and variables.
 * 
 * @param {Object} part - The cabinet part with formulas
 * @param {Object} variables - Object containing variable values
 * @returns {Object} - Object with calculated width, height, and depth
 */
export const evaluatePartDimensions = (part, variables) => {
  const dimensions = {
    width: 0,
    height: 0,
    depth: 0
  };
  
  if (part.formula_width) {
    dimensions.width = evaluateFormula(part.formula_width, variables);
  }
  
  if (part.formula_height) {
    dimensions.height = evaluateFormula(part.formula_height, variables);
  }
  
  if (part.formula_depth) {
    dimensions.depth = evaluateFormula(part.formula_depth, variables);
  }
  
  return dimensions;
};