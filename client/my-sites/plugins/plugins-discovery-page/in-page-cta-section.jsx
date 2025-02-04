import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import videoImage from 'calypso/assets/images/marketplace/plugins-video.jpg';
import WPLogo from 'calypso/assets/images/marketplace/wp-logo.svg';
import Section, {
	SectionContainer,
	SectionHeaderContainer,
	SectionHeader,
} from 'calypso/components/section';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/route';
import { getSectionName } from 'calypso/state/ui/selectors';

const InPagetCTAContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: var( --studio-blue-50 );
	margin: 22px 16px 0;
	padding: 42px 24px;
	border-radius: 4px;
	row-gap: 32px;

	${ SectionContainer } {
		position: relative;
		padding: 0;
	}
	${ SectionContainer }::before {
		display: none;
	}

	${ SectionHeaderContainer } {
		padding: 0;
		max-width: 439px;
		margin-bottom: 24px;
	}

	${ SectionHeader } {
		font-size: 1.625rem;
		line-height: 1.1;
	}

	.button.is-primary {
		--color-accent: #000;
		--color-accent-60: #1d2327;

		min-width: 122px;
	}

	@media ( min-width: 661px ) {
		margin-left: 0;
		margin-right: 0;
		flex-direction: row;
		column-gap: 70px;

		${ SectionHeader } {
			line-height: 1.3;
		}
	}

	@media ( min-width: 782px ) {
		padding: 60px 42px 50px;
	}
`;

const Illustration = styled.div`
	position: relative;
	margin: 0 40px;

	& > img {
		border-radius: 4px;
	}
	@media ( min-width: 661px ) {
		margin-right: 0;
	}
	@media ( min-width: 782px ) {
		margin: 0 40px;
	}
`;

const Widget = styled.div`
	position: absolute;
	background: rgba( 245, 245, 245, 0.3 );
	line-height: 1;

	backdrop-filter: blur( 7px );
	-webkit-backdrop-filter: blur( 7px );
	border-radius: 4px;

	&.in-page-cta-section__views {
		padding: 7px 11px;
		font-size: 0.626rem;
		color: var( --studio-black );
		bottom: 48px;
		left: -40px;
		font-weight: 600;

		span {
			font-size: 1rem;
			margin-left: 5px;
			font-weight: 600;
		}
	}

	&.in-page-cta-section__wp-logo {
		padding: 12px 14px;
		top: 30px;
		right: -33px;
	}
`;

const InPageCTASection = () => {
	const { __ } = useI18n();
	const sectionName = useSelector( getSectionName );
	const startUrl = addQueryArgs(
		{
			ref: sectionName + '-lp',
		},
		'/start/business'
	);

	const trackCTAClick = useCallback( () => {
		recordTracksEvent( 'calypso_plugin_in_page_cta_click' );
	}, [] );

	return (
		<InPagetCTAContainer>
			<Illustration>
				<Widget className="in-page-cta-section__views">
					{ __( 'Views' ) } <span className="wp-brand-font">1,250</span>
				</Widget>
				<img width={ 286 } height={ 193 } src={ videoImage } alt="Video" />
				<Widget className="in-page-cta-section__wp-logo">
					<img width={ 40 } height={ 40 } src={ WPLogo } alt="WordPress" />
				</Widget>
			</Illustration>
			<Section
				header={ preventWidows(
					__(
						'Build your site. Sell your stuff. Start your blog. This and much more with unlimited plugins!'
					)
				) }
				dark
			>
				<Button
					className="is-primary marketplace-cta in-page-cta"
					href={ startUrl }
					onClick={ trackCTAClick }
				>
					{ __( 'Get Started' ) }
				</Button>
			</Section>
		</InPagetCTAContainer>
	);
};

export default InPageCTASection;
