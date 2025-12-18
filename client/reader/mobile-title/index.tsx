import './style.scss';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import ReaderSearchIcon from 'calypso/reader/components/icons/search-icon';

interface Props {
	noPadding?: boolean;
}
export const MobileTitle = ( { noPadding = false }: Props ) => {
	const isMobile = useViewportMatch( 'medium', '<' );
	if ( ! isMobile ) {
		return null;
	}
	const className = clsx( 'app-title', {
		'no-padding': noPadding,
	} );
	return (
		<HStack className={ className } spacing={ 2 } justify="space-between" alignment="center">
			<h1>{ __( 'Reader' ) }</h1>
			<Button icon={ <ReaderSearchIcon /> } label={ __( 'Search' ) } href="/reader/search" />
		</HStack>
	);
};
