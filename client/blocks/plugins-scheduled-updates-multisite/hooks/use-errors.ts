import { useContext } from 'react';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import { SiteSlug } from 'calypso/types';
import { MultisitePluginUpdateManagerContext } from '../context';

export const useErrors = () => {
	const { errors, setErrors } = useContext( MultisitePluginUpdateManagerContext );
	const sites = useSelector( getSites );

	const addError = ( siteSlug: SiteSlug, error: string ) => {
		const site = sites.find( ( site ) => site?.slug === siteSlug );
		setErrors( ( prevErrors ) => [ ...( prevErrors || [] ), { siteSlug, error, site } ] );
	};

	const clearErrors = () => {
		setErrors( [] );
	};

	return { errors, addError, clearErrors };
};
