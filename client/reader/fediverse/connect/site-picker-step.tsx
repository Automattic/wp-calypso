/**
 * @jest-environment jsdom
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import SiteSelector from 'calypso/components/site-selector';

interface Props {
	onPick: ( blogId: number ) => void;
}

export function SitePickerStep( { onPick }: Props ) {
	const translate = useTranslate();

	const handleSiteSelect = ( siteId: number ) => {
		onPick( siteId );
		// Return true so SiteSelector does not navigate away.
		return true;
	};

	return (
		<VStack spacing={ 4 }>
			<h2>{ translate( 'Connect a Fediverse site' ) }</h2>
			<p>
				{ translate(
					'Choose a WordPress.com site or a Jetpack-connected site to broadcast Notes from.'
				) }
			</p>
			<SiteSelector onSiteSelect={ handleSiteSelect } />
		</VStack>
	);
}
