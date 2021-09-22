// eslint-disable-next-line jsdoc/check-tag-names
/** @jsx jsx */

import { Button, Gridicon } from '@automattic/components';
import { css, jsx } from '@emotion/react';
import styled from '@emotion/styled';
import page from 'page';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ButtonGroup from 'calypso/components/button-group';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import PhoneInput from 'calypso/components/phone-input';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import getCountries from 'calypso/state/selectors/get-countries';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const TILE_HEIGHT_PX = 560;

const Tile = styled.div`
	height: ${ TILE_HEIGHT_PX }px;
	margin: 0;
	.form-section-heading {
		margin-bottom: 30px;
		line-height: 1.75rem;
	}

	.form-fieldset {
		margin-bottom: 25px;
	}
`;

const Slider = styled.div`
	width: 100%;
	height: ${ TILE_HEIGHT_PX }px;
	overflow: scroll;
	scroll-behavior: smooth;
	&::-webkit-scrollbar {
		display: none;
	}
`;

const ButtonContainer = styled.button`
	display: flex;
	position: absolute;
	bottom: 0;
	right: 0;
`;

const Container = styled.div`
	width: 100%;
	height: ${ TILE_HEIGHT_PX + 100 }px;
	padding: 0px;
	border-radius: 4px;
	overflow: hidden;
	position: relative;
`;

function SiteInformationCollection() {
	const tileContainerRef = useRef( null );
	const countriesList = useSelector( ( state ) => getCountries( state, 'sms' ) );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const checkout = async () => {
		setIsFormSubmitted( true );
		selectedSiteSlug
			? page( `/checkout/${ selectedSiteSlug }/wp_difm_lite` )
			: page( '/checkout/wp_difm_lite' );
	};

	const onScroll = ( direction: string ) => {
		if ( ! tileContainerRef.current ) {
			return;
		}
		const partialScrolledDistance = Math.round(
			tileContainerRef.current.scrollTop % TILE_HEIGHT_PX
		);
		switch ( direction ) {
			case 'up':
				partialScrolledDistance
					? tileContainerRef.current.scrollBy( 0, -1 * partialScrolledDistance )
					: tileContainerRef.current.scrollBy( 0, -1 * TILE_HEIGHT_PX );
				break;
			case 'down':
				partialScrolledDistance
					? tileContainerRef.current.scrollBy( 0, TILE_HEIGHT_PX - partialScrolledDistance )
					: tileContainerRef.current.scrollBy( 0, TILE_HEIGHT_PX );
				break;
		}
	};

	return (
		<ActionPanel>
			<ActionPanelBody>
				<Container>
					<FormattedHeader
						brandFont
						headerText="Tell us more about your site"
						align="left"
						css={ css`
							margin: 10px 0 20px 0 !important;
						` }
					/>

					<ButtonContainer>
						<ButtonGroup>
							<Button onClick={ () => onScroll( 'up' ) }>
								<Gridicon icon="arrow-up" />
							</Button>
							<Button onClick={ () => onScroll( 'down' ) }>
								<Gridicon icon="arrow-down" />
							</Button>
						</ButtonGroup>
					</ButtonContainer>
					<Slider id="slider" ref={ tileContainerRef }>
						<Tile>
							<FormSectionHeading>
								Before continuing, please make sure that you have the following information at hand
								and in a finalized state
							</FormSectionHeading>

							<ol>
								<li>
									General business information, including business name, tagline or slogan (if
									applicable), and a description of your business.
								</li>
								<li>
									Contact information, including business email address, phone number and physical
									address (if applicable), and social media profile links.
								</li>
								<li>A logo, if available.</li>
								<li>The text you would like us to use on each page.</li>
								<li>
									Optional - up to 3 images per page. If you don't provide any images, we will use
									stock images related to your business. You will be able to modify your answers in
									this questionnaire until you submit it. Don't worry - we will ask you if you're
									sure first!
								</li>
							</ol>
						</Tile>
						<Tile>
							<FormFieldset>
								<FormLabel htmlFor="businessName">What is the name of your business?</FormLabel>
								<FormSettingExplanation>
									Please write it as you want it to appear on your new site.
								</FormSettingExplanation>
								<FormTextInput id="businessName" name="businessName" />
							</FormFieldset>
							<FormSectionHeading>General Business Information</FormSectionHeading>
							<FormSettingExplanation>
								The next few questions will collect links and contact information related to your
								business.
							</FormSettingExplanation>
							<FormFieldset>
								<FormLabel htmlFor="businessInformation">
									Do you have an existing website for this business?
								</FormLabel>
								<FormSettingExplanation>
									If so, please provide the link below.
								</FormSettingExplanation>
								<FormTextInput name="businessSite" id="businessSite" />
							</FormFieldset>
							<FormFieldset>
								<FormLabel htmlFor="businessInformation">
									Do you have social media profiles for your business?
								</FormLabel>
								<FormSettingExplanation>
									Please add links to any social media profiles you would like to use on your new
									site.
								</FormSettingExplanation>
								<FormTextInput name="businessSite" id="businessSite" />
							</FormFieldset>
							<FormFieldset>
								<FormLabel htmlFor="email">
									What email address would you like us to use for site visitors to contact you?
								</FormLabel>
								<FormTextInput name="email" id="email" />
							</FormFieldset>
						</Tile>
						<Tile>
							<FormFieldset>
								<FormLabel htmlFor="phone">
									What phone number should we display for your business?
								</FormLabel>
								<PhoneInput countriesList={ countriesList } value="" countryCode="US" />
							</FormFieldset>
							<FormFieldset>
								<FormLabel htmlFor="address">
									What physical address should we display for your business?
								</FormLabel>
								<FormSettingExplanation>
									Please leave this question blank if you don’t want us to display a street address.
								</FormSettingExplanation>
								<FormTextInput name="address" id="address" />
							</FormFieldset>
						</Tile>
					</Slider>
					<button onClick={ checkout }>Submit</button>
				</Container>
			</ActionPanelBody>
		</ActionPanel>
	);
}

export default function WrappedSiteInformationCollection(
	props: SiteInfoCollectionProps
): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<SiteInformationCollection { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
