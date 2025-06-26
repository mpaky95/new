import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  permission: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  requireAll?: boolean;
}

/**
 * A component that conditionally renders its children based on user permissions
 * 
 * @param permission - A single permission string or array of permission strings to check
 * @param fallback - Optional content to render if user doesn't have the required permissions
 * @param children - Content to render if user has the required permissions
 * @param requireAll - If true and permission is an array, all permissions are required. Default is false (any permission is sufficient)
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  fallback = (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
      <div className="flex items-start">
        <ShieldAlert className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Permission Required</h3>
          <p className="text-sm text-yellow-700 mt-1">
            You don't have the necessary permissions to access this feature.
          </p>
        </div>
      </div>
    </div>
  ), 
  children,
  requireAll = false
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  
  // Check if user has the required permission(s)
  const hasAccess = () => {
    if (Array.isArray(permission)) {
      return requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission);
    }
    return hasPermission(permission);
  };

  return hasAccess() ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;