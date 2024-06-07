import { AgencyDirectoryApplication } from '../types';

/*
 * Check if the form has services selected
 */
export function hasServices( formData: AgencyDirectoryApplication ): boolean {
	return formData.services.length > 0;
}

/*
 * Check if the form has products selected
 */
export function hasProducts( formData: AgencyDirectoryApplication ): boolean {
	return formData.products.length > 0;
}

/*
 * Check if the form has directories selected
 */
export function hasDirectory( formData: AgencyDirectoryApplication ): boolean {
	return formData.directories.length > 0;
}

export function isValidApplicationForm( formData: AgencyDirectoryApplication ): boolean {
	return hasServices( formData ) && hasProducts( formData ) && hasDirectory( formData );
}
