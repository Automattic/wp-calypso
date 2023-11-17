import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import iconReaderLightbulb from 'calypso/assets/images/customer-home/reader-lightbulb.svg';
import withDimensions from 'calypso/lib/with-dimensions';
import wpcom from 'calypso/lib/wp';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import DiscoverNavigation from 'calypso/reader/discover/discover-navigation';
import { DEFAULT_TAB, buildDiscoverStreamKey } from 'calypso/reader/discover/helper';
import Stream from 'calypso/reader/stream';

import './style.scss';

interface ReaderCardProps {
	width: number;
}

const ReaderCard = ( props: ReaderCardProps ) => {
	const translate = useTranslate();
	const locale = useLocale();

	const { data: interestTags = [] } = useQuery( {
		queryKey: [ 'read/interests', locale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/interests`,
					apiNamespace: 'wpcom/v2',
				},
				{
					_locale: locale,
				}
			),
		select: ( data ) => {
			return data.interests;
		},
	} );

	const queryParams = new URLSearchParams( window.location.search );
	const selectedTab = queryParams.get( 'selectedTab' ) || DEFAULT_TAB;

	const streamKey = buildDiscoverStreamKey( selectedTab, [ 'dailyprompt' ] );

	return (
		<>
			<div className="reader-card customer-home__card">
				<div className="reader-card__header">
					<h2 className="reader-card__title">
						<div className="reader-card__title-icon">
							<img src={ iconReaderLightbulb } alt="" />
						</div>
						<span>{ translate( 'Increase Views by Engaging with Others' ) }</span>
					</h2>
					<span className="reader-card__subtitle">
						{ translate(
							'You have more chances to pomp up your views when joining new conversations.'
						) }
					</span>
				</div>
				<DiscoverNavigation
					width={ props.width }
					selectedTab={ selectedTab }
					recommendedTags={ interestTags }
				/>
				<Stream
					streamKey={ streamKey }
					trackScrollPage={ trackScrollPage.bind( null ) }
					useCompactCards={ true }
					isDiscoverStream={ true }
					suppressSiteNameLink={ true }
				/>
			</div>
		</>
	);
};

export default withDimensions( ReaderCard );
