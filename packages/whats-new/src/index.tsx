/* eslint-disable no-restricted-imports */
import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useSelect } from '@wordpress/data';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import Guide from './components/guide';
import WhatsNewPage from './whats-new-page';
import './style.scss';

export const HELP_CENTER_STORE = HelpCenter.register();

interface Props {
	onClose: () => void;
}

interface WhatsNewAnnouncement {
	announcementId: string;
	description: string;
	heading: string;
	imageSrc: string;
	isLocalized: boolean;
	link: string;
	responseLocale: string;
}

interface APIFetchOptions {
	global: boolean;
	path: string;
}

const WhatsNewGuide: React.FC< Props > = ( { onClose } ) => {
	const locale = useLocale();

	const isWhatsNewModalShown = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.isWhatsNewModalShown();
	}, [] );

	const { data, isLoading } = useQuery< WhatsNewAnnouncement[] >( {
		queryKey: [ 'WhatsNewAnnouncements' ],
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `/whats-new/list?_locale=${ locale }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						global: true,
						path: `/wpcom/v2/block-editor/whats-new-list?_locale=${ locale }`,
				  } as APIFetchOptions ),
		refetchOnWindowFocus: false,
	} );

	if ( ! isWhatsNewModalShown || ! data || isLoading ) {
		return null;
	}

	return (
		<Guide
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className="whats-new-guide__main"
			onFinish={ onClose }
		>
			{ data.map( ( page, index ) => (
				<WhatsNewPage
					key={ page.announcementId }
					pageNumber={ index + 1 }
					isLastPage={ index === data.length - 1 }
					description={ page.description }
					heading={ page.heading }
					imageSrc={ page.imageSrc }
					link={ page.link }
				/>
			) ) }
		</Guide>
	);
};

export default WhatsNewGuide;
