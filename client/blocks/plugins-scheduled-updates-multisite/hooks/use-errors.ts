import { useContext } from 'react';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import { SiteSlug } from 'calypso/types';
import { MultisitePluginUpdateManagerContext } from '../context';

export const useErrors = () => {
	const { errors, setErrors } = useContext( MultisitePluginUpdateManagerContext );
	const sites = useSelector( getSites );

	const addError = (
		siteSlug: SiteSlug,
		operation: 'create' | 'update' | 'delete',
		error: string
	) => {
		const site = sites.find( ( site ) => site?.slug === siteSlug );
		setErrors( ( prevErrors ) => [
			...( prevErrors || [] ),
			{ siteSlug, error, operation, site },
		] );
	};

	const clearErrors = () => {
		setErrors( [] );
	};

	const createErrors = errors.filter( ( error ) => error.operation === 'create' );
	const updateErrors = errors.filter( ( error ) => error.operation === 'update' );
	const deleteErrors = errors.filter( ( error ) => error.operation === 'delete' );

	return { errors, createErrors, updateErrors, deleteErrors, addError, clearErrors };
};
