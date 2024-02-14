import { Button, Card } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import ExternalLink from 'calypso/components/external-link';
import FeatureItem from 'calypso/components/feature-item';
import Section, { SectionContainer } from 'calypso/components/section';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/route';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { isUserLoggedIn, getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
import { useEducationLinksList, useFeaturesList } from './use-lists';
import './style.scss';

const MarketplaceContainer = styled.div< { isloggedIn: boolean } >`
	${ ( { isloggedIn } ) =>
		! isloggedIn &&
		`${ SectionContainer } {
		padding-bottom: 0;
	}` }

	${ SectionContainer }::before {
		background-color: var( --studio-gray-0 );
	}
`;

export const MarketplaceFooter = () => {
	const { __ } = useI18n();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
	const sectionName = useSelector( getSectionName );

	const startUrl = addQueryArgs(
		{
			ref: sectionName + '-lp',
		},
		sectionName === 'plugins' ? '/start/business' : '/start'
	);

	const features = useFeaturesList();

	return (
		<MarketplaceContainer isloggedIn={ isLoggedIn }>
			<Section
				header={ preventWidows( __( 'You pick the plugin. We’ll take care of the rest.' ) ) }
			>
				<>
					{ ( ! isLoggedIn || currentUserSiteCount === 0 ) && (
						<Button className="is-primary marketplace-cta" href={ startUrl }>
							{ __( 'Get started' ) }
						</Button>
					) }
					<div className="marketplace__cards">
						{ features.map( ( { id, header, text } ) => (
							<FeatureItem key={ id } header={ header }>
								{ text }
							</FeatureItem>
						) ) }
					</div>
				</>
			</Section>
		</MarketplaceContainer>
	);
};

const EducationFooter = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const onClickLinkCard = useCallback(
		( content_type: string ) => {
			dispatch(
				recordTracksEvent( 'calypso_plugins_educational_content_click', { content_type } )
			);
		},
		[ dispatch ]
	);

	const links = useEducationLinksList();

	return (
		<div className="education-footer__container">
			<Section
				header={ __( 'Get started with plugins' ) }
				subheader={ __( 'Our favorite how-to guides to get you started with plugins' ) }
			>
				<div className="education-footer__cards">
					{ links.map( ( { id, title, url } ) => (
						<Card compact key={ id }>
							<p>{ title }</p>
							<ExternalLink
								href={ url }
								onClick={ () => onClickLinkCard( id ) }
								target="_blank"
								icon
							>
								{ __( 'Read more' ) }
							</ExternalLink>
						</Card>
					) ) }
				</div>
			</Section>
		</div>
	);
};

export default EducationFooter;
