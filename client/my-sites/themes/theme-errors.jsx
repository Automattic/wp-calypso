import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import wpcom from 'calypso/lib/wp';

/**
 * We make a separate request rather than using getSite here to
 * avoid querying the WP.com cache of a site, which returns theme
 * errors for the multisite (caused by its 'force=wpcom' param).
 */
async function querySiteDataWithoutForceWpcom( siteId ) {
	return await wpcom.req.get( {
		path: '/sites/' + encodeURIComponent( siteId ),
		apiVersion: '1.1',
	} );
}

const ThemeErrors = ( { siteId } ) => {
	const translate = useTranslate();
	const [ themeErrors, setThemeErrors ] = useState( [] );

	useEffect( () => {
		const fetchData = async () => {
			const siteData = await querySiteDataWithoutForceWpcom( siteId );
			const errors = siteData?.options?.theme_errors;
			setThemeErrors( errors || [] );
		};

		fetchData();
	}, [ siteId ] );

	const dismissNotice = ( themeName, errorIndex ) => {
		setThemeErrors( ( prevErrors ) =>
			prevErrors
				.map( ( theme ) =>
					theme.name === themeName
						? {
								...theme,
								errors: theme.errors.filter( ( _, index ) => index !== errorIndex ),
						  }
						: theme
				)
				.filter( ( theme ) => theme.errors.length > 0 )
		);
	};

	if ( themeErrors.length === 0 ) {
		return null;
	}

	return (
		<>
			{ themeErrors.map( ( theme ) =>
				theme.errors.map( ( error, index ) => (
					<Notice
						status="is-error"
						key={ index }
						onDismissClick={ () => dismissNotice( theme.name, index ) }
					>
						{ translate( 'Error with theme {{strong}}%(themeName)s{{/strong}}: %(themeError)s', {
							args: {
								themeName: theme.name,
								themeError: error,
							},
							components: {
								strong: <strong />,
							},
						} ) }
					</Notice>
				) )
			) }
		</>
	);
};

export default ThemeErrors;
