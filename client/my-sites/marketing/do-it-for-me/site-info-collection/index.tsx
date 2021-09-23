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
import FormTextArea from 'calypso/components/forms/form-textarea';
import FormRadio from 'calypso/components/forms/form-radio';
import PhoneInput from 'calypso/components/phone-input';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import getCountries from 'calypso/state/selectors/get-countries';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import CardHeading from 'calypso/components/card-heading';
import FilePicker from 'calypso/components/file-picker';
import IT from 'calypso/assets/images/difm/IT-1.png';
import consult1 from 'calypso/assets/images/difm/consult-1.png';
import consult2 from 'calypso/assets/images/difm/consult-2.png';
import dietician from 'calypso/assets/images/difm/dietician-1.png';
import musician from 'calypso/assets/images/difm/musician-1.png';
import photography from 'calypso/assets/images/difm/photography-1.png';
import phsych from 'calypso/assets/images/difm/phsych-1.png';
import restaurant from 'calypso/assets/images/difm/restaurant-1.png';
import treeremoval from 'calypso/assets/images/difm/tree-removal.png';

import './style.scss';

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
	height: ${ TILE_HEIGHT_PX + 125 }px;
	padding: 0px;
	border-radius: 4px;
	overflow: hidden;
	position: relative;
`;

const OrderedList = styled.ol`
	margin-bottom: 30px;
	line-height: 1.75rem;
	font-size: 1rem;
`;

const VerticalsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat( 2, 1fr );
	grid-template-rows: repeat( 2, 1fr );
	gap: 0.75em;
	text-align: center;
	@media ( max-width: 960px ) {
		grid-template-columns: 1fr;
		grid-template-rows: auto;
	}
`;

function DemoTile( { image, description } ) {
	return (
		<div
			css={ css`
				height: 230px;
				overflow: hidden;
				margin: 10px 0px;
				border: 1px dashed #ababab;
				padding: 10px 10px 0px 10px;
				cursor: pointer;
				&:hover {
					border: 1px solid black;
				}
			` }
		>
			<div
				css={ css`
					height: 162px;
					overflow: hidden;
				` }
			>
				<img src={ image } width="100%" alt="WordPress logo" />
			</div>
			<div
				css={ css`
					height: 54px;
					display: flex;
					background: #eee;
				` }
			>
				<h2
					css={ css`
						flex: 1 1 auto;
						color: var( --color-neutral-70 );
						font-size: 0.875rem;
						font-weight: 600;
						padding: 16px 14px;
					` }
				>
					{ description }
				</h2>
				<span className="theme__badge-price theme__badge-price-upgrade"></span>
				<span className="theme__more-button">
					<button></button>
				</span>
			</div>
		</div>
	);
}

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
		<ActionPanel className="site-info-collection__container">
			<ActionPanelBody>
				<Container>
					<FormattedHeader
						brandFont
						headerText="Tell us more about your site"
						align="left"
						css={ css`
							margin: 10px 0 20px 0 !important;
							line-height: 30px;
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

						<Button onClick={ () => checkout() }>Checkout</Button>
					</ButtonContainer>
					<Slider id="slider" ref={ tileContainerRef }>
						<Tile>
							<CardHeading
								tagName="h4"
								size={ 21 }
								css={ css`
									margin: 10px 0 20px 0 !important;
								` }
							>
								Before continuing, please make sure that you have the following information at hand
								and in a finalized state
							</CardHeading>
							<OrderedList>
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
							</OrderedList>
						</Tile>
						<Tile>
							<FormSectionHeading>General Business Information</FormSectionHeading>
							<FormSettingExplanation>
								The next few questions will collect links and contact information related to your
								business.
							</FormSettingExplanation>
							<FormFieldset>
								<FormLabel htmlFor="businessName">What is the name of your business?</FormLabel>
								<FormSettingExplanation>
									Please write it as you want it to appear on your new site.
								</FormSettingExplanation>
								<FormTextInput id="businessName" name="businessName" />
							</FormFieldset>

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
						</Tile>
						<Tile>
							<FormFieldset>
								<FormLabel htmlFor="email">
									What email address would you like us to use for site visitors to contact you?
								</FormLabel>
								<FormTextInput name="email" id="email" />
							</FormFieldset>
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
								<FormTextArea name="address" id="address" />
							</FormFieldset>
							<FormFieldset>
								<FormLabel htmlFor="slogan">Does your business have a tagline or slogan?</FormLabel>
								<FormSettingExplanation>Please list it below.</FormSettingExplanation>
								<FormTextInput name="slogan" id="slogan" />
							</FormFieldset>
						</Tile>
						<Tile>
							<FormFieldset>
								<FormLabel htmlFor="slogan">
									Please provide a brief description of your business.
								</FormLabel>
								<FormTextArea
									css={ css`
										width: 100%;
										height: ${ TILE_HEIGHT_PX - 50 }px;
									` }
									name="description"
									id="description"
								/>
							</FormFieldset>
						</Tile>
						<Tile>
							<FormSectionHeading>Design</FormSectionHeading>
							<FormSettingExplanation>
								The next few questions will collect links and contact information related to your
								business.
							</FormSettingExplanation>
							<FormFieldset>
								<FormLabel htmlFor="slogan">Please upload your logo if you have one. </FormLabel>
								<FilePicker multiple accept="image/*" onPick={ console.log.bind( console ) }>
									<Button>Select Files</Button>
								</FilePicker>
							</FormFieldset>
							<FormFieldset>
								<FormLabel htmlFor="slogan">
									Do you want a blog included with your new site?
								</FormLabel>
								<FormLabel>
									<FormRadio value="yes" checked={ true } onChange={ () => {} } label="Yes" />
								</FormLabel>

								<FormLabel>
									<FormRadio value="no" checked={ false } onChange={ () => {} } label="No" />
								</FormLabel>
							</FormFieldset>

							<FormFieldset>
								<FormLabel htmlFor="slogan">
									Which of the following options best describes your business?
								</FormLabel>
								<FormLabel>
									<FormRadio
										value="professional-services"
										checked={ true }
										onChange={ () => {} }
										label="Professional Services"
									/>
								</FormLabel>
								<FormLabel>
									<FormRadio
										value="local-service"
										checked={ false }
										onChange={ () => {} }
										label="Local Service"
									/>
								</FormLabel>
								<FormLabel>
									<FormRadio
										value="creative-arts"
										checked={ false }
										onChange={ () => {} }
										label="Creative Arts"
									/>
								</FormLabel>
								<FormLabel>
									<FormRadio
										value="restaurants"
										checked={ false }
										onChange={ () => {} }
										label="Restaurants"
									/>
								</FormLabel>
							</FormFieldset>
						</Tile>
						<Tile>
							<FormLabel htmlFor="slogan">
								Please choose one of the templates below for your new professional services site.{ ' ' }
							</FormLabel>
							<VerticalsGrid>
								<DemoTile image={ photography } description={ 'choice-1' } />
								<DemoTile image={ musician } description={ 'choice-2' } />
								<DemoTile image={ phsych } description={ 'choice-3' } />
								<DemoTile image={ dietician } description={ 'choice-4' } />
							</VerticalsGrid>
						</Tile>
					</Slider>
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
