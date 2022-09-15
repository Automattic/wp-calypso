import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import QueryMedia from 'calypso/components/data/query-media';
import getMediaFound from 'calypso/state/selectors/get-media-found';

interface Props {
	siteId: number;
}

export default function JetpackBenefitsCardVideoPress( props: Props ) {
	const translate = useTranslate();
	const mediaQuery = { mime_type: 'video/videopress', number: 1 }; // we only want the total count, no actual media items returned. Set to 1 to keep response size small (0 is not a valid value).
	const mediaFound = useSelector( ( state ) =>
		getMediaFound( state, String( props.siteId ), mediaQuery )
	);

	return (
		<>
			<QueryMedia siteId={ props.siteId } query={ mediaQuery } />
			<JetpackBenefitsCard
				headline={ translate( 'Video Hosting' ) }
				description={ translate( 'Videos hosted with VideoPress' ) }
				stat={ mediaFound }
				placeholder={ ! mediaFound }
			/>
		</>
	);
}
