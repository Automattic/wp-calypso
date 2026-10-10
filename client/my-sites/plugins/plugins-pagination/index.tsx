import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import './style.scss';

export function getPluginsPageUrl( path: string, page: number ) {
	const url = new URL( path, 'https://wordpress.com' );
	if ( page === 1 ) {
		url.searchParams.delete( 'page' );
	} else {
		url.searchParams.set( 'page', String( page ) );
	}
	return url.pathname + url.search + url.hash;
}

type Props = {
	path: string;
	page: number;
	pages: number;
	isFetching?: boolean;
	isError?: boolean;
	isEmpty: boolean;
	retry?: () => void;
};

export default function PluginsPagination( {
	path,
	page,
	pages,
	isFetching,
	isError,
	isEmpty,
	retry,
}: Props ) {
	if ( isFetching ) {
		return null;
	}
	if ( isError ) {
		return (
			<div className="plugins-pagination">
				<p role="alert">{ __( 'Unable to load plugins. Please try again.' ) }</p>
				<Button variant="secondary" onClick={ retry }>
					{ __( 'Retry' ) }
				</Button>
			</div>
		);
	}
	if ( isEmpty ) {
		return (
			<div className="plugins-pagination">
				<p>{ __( 'No plugins found on this page.' ) }</p>
				{ page > 1 && (
					<Button variant="secondary" href={ getPluginsPageUrl( path, 1 ) }>
						{ __( 'Go to the first page' ) }
					</Button>
				) }
			</div>
		);
	}

	return (
		<nav className="plugins-pagination" aria-label={ __( 'Plugin result pages' ) }>
			{ page > 1 && (
				<Button variant="secondary" href={ getPluginsPageUrl( path, page - 1 ) } rel="prev">
					{ __( 'Previous' ) }
				</Button>
			) }
			<span>
				{ sprintf(
					/* translators: %1$d: current page, %2$d: total pages. */ __( 'Page %1$d of %2$d' ),
					page,
					pages
				) }
			</span>
			{ page < pages && (
				<Button variant="secondary" href={ getPluginsPageUrl( path, page + 1 ) } rel="next">
					{ __( 'Next' ) }
				</Button>
			) }
		</nav>
	);
}
