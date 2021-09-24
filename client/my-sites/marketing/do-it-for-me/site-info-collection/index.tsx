// eslint-disable-next-line jsdoc/check-tag-names
/** @jsx jsx */

import { Button, Gridicon as Gridiron } from '@automattic/components';
import { css, jsx } from '@emotion/react';
import styled from '@emotion/styled';
import page from 'page';
import React, { useRef, useState, Fragment } from 'react';
import { useSelector } from 'react-redux';
import dietician from 'calypso/assets/images/difm/dietician-1.png';
import musician from 'calypso/assets/images/difm/musician-1.png';
import photography from 'calypso/assets/images/difm/photography-1.png';
import phsych from 'calypso/assets/images/difm/phsych-1.png';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ButtonGroup from 'calypso/components/button-group';
import CardHeading from 'calypso/components/card-heading';
import FilePicker from 'calypso/components/file-picker';
import FormattedHeader from 'calypso/components/formatted-header';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextArea from 'calypso/components/forms/form-textarea';
import PhoneInput from 'calypso/components/phone-input';
import WebPreview from 'calypso/components/web-preview';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import getCountries from 'calypso/state/selectors/get-countries';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const TILE_HEIGHT_PX = 560;

const Tile = styled.div`
	height: ${ TILE_HEIGHT_PX }px;
	margin: 0;

	@media ( max-width: 960px ) {
		height: auto;
		&:last-child {
			margin-bottom: 100px;
		}
	}
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
	z-index: 300;
	@media ( max-width: 960px ) {
		position: fixed;
		width: 100%;
		.button-group {
			display: none;
		}
		.do-it-for-me__checkout {
			width: 100%;
			position: fixed;
		}
	}
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
	margin-left: 1.1em;
`;

const VerticalsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat( 2, 1fr );
	grid-template-rows: repeat( 2, 1fr );
	gap: 1em;
	text-align: center;
	padding: 1px;
	@media ( max-width: 960px ) {
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		gap: 0.5em;
	}
`;

// eslint-disable-next-line @typescript-eslint/no-empty-function
function empty() {}

function DemoTile( { id, selectedDesign, image, name, onShowPreview } ) {
	const isSelected = selectedDesign === id;
	return (
		<div
			css={ css`
				height: 230px;
				overflow: hidden;
				box-shadow: 0 0 0 1px var( --color-border-subtle );
				padding: 5px;
				cursor: pointer;
				position: relative;
				background: ${ isSelected ? 'var( --color-border-subtle )' : 'white' };
				box-shadow: ${ isSelected
					? '0 0 0 1px var( --color-neutral-light ), 0 2px 4px var( --color-neutral-10 )'
					: 'none' };
				@media ( max-width: 960px ) {
					height: 85px;
					display: flex;
					padding: 5px;
				}
				&:hover {
					box-shadow: 0 0 0 1px var( --color-neutral-light ), 0 2px 4px var( --color-neutral-10 );
				}
				&:hover .site-info-collection__preview {
					opacity: 1;
					animation: theme__thumbnail-label 200ms ease-in-out;
				}
				&:hover img {
					filter: blur( 2px );
					-webkit-filter: blur( 2px );
					-moz-filter: blur( 2px );
					-o-filter: blur( 2px );
					-ms-filter: blur( 2px );
					-webkit-transition: 200ms -webkit-filter linear;
					-moz-transition: 200ms -moz-filter linear;
					-moz-transition: 200ms filter linear;
					-ms-transition: 200ms -ms-filter linear;
					-o-transition: 200ms -o-filter linear;
					transition: 200ms filter linear, 200ms -webkit-filter linear;
				}
			` }
		>
			<Button
				className="site-info-collection__preview"
				onClick={ onShowPreview }
				css={ css`
					opacity: 0;
					z-index: 5;
					position: absolute;
					top: 36%;
					left: 40%;
					font-weight: 600;
					@media ( max-width: 960px ) {
						opacity: 1;
						left: 25%;
						top: 25%;
					}
				` }
			>
				Preview
			</Button>
			<div
				css={ css`
					width: 100%;
					height: 80%;
					overflow: hidden;
					@media ( max-width: 960px ) {
						height: 100%;
						width: 75%;
					}
				` }
			>
				<img src={ image } width="100%" alt="WordPress logo" />
			</div>
			<div
				css={ css`
					width: 100%;
					height: 20%;
					display: flex;
					justify-content: space-evenly;
					background: white;
					border: 1px solid var( --color-neutral-0 );
					@media ( max-width: 960px ) {
						align-items: center;
						height: 100%;
						width: 25%;
						display: flex;
						flex-direction: column;
					}
				` }
			>
				<h2
					css={ css`
						width: 80%;
						color: var( --color-neutral-70 );
						font-size: 0.875rem;
						font-weight: 600;
						padding: 0;
						display: flex;
						align-items: center;
						justify-content: center;
					` }
				>
					{ name }
				</h2>
				<div
					css={ css`
						border-left: 1px solid var( --color-neutral-0 );
						width: 20%;
						display: flex;
						align-items: center;
						justify-content: center;
					` }
				>
					<FormLabel>
						<FormInputCheckbox name="description" checked={ isSelected } onChange={ empty } />
					</FormLabel>
				</div>
			</div>
		</div>
	);
}

function SiteInformationCollection( { onSubmit } ) {
	const tileContainerRef = useRef( null );
	const [ sitePreviewVisibility, setSitePreviewVisibility ] = useState( false );
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
		<Fragment>
			{ sitePreviewVisibility && (
				<WebPreview
					showPreview={ true }
					showExternal={ false }
					showSEO={ false }
					onClose={ () => setSitePreviewVisibility( false ) }
					previewUrl={
						'https://miriamspsychologypractise.wordpress.com/' +
						'?demo=true&iframe=true&theme_preview=true'
					}
					externalUrl={ 'https://miriamspsychologypractise.wordpress.com/' }
					belowToolbar={ true }
				></WebPreview>
			) }
			<ActionPanel
				className="site-info-collection__container"
				css={ css`
					max-width: 1024px;
				` }
			>
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
									<Gridiron icon="arrow-up" />
								</Button>
								<Button onClick={ () => onScroll( 'down' ) }>
									<Gridiron icon="arrow-down" />
								</Button>
							</ButtonGroup>

							<Button
								css={ css`
									bottom: 0;
								` }
								className="site-info-collection__checkout"
								onClick={ () => ( onSubmit ? onSubmit() : checkout() ) }
							>
								Checkout
							</Button>
						</ButtonContainer>
						<Slider id="slider" ref={ tileContainerRef }>
							<Tile>
								<CardHeading
									tagName="h4"
									size={ 21 }
									css={ css`
										margin: 10px 0 20px 0 !important;
										line-height: 1.35em;
									` }
								>
									Before continuing, please make sure that you have the following information at
									hand and in a finalized state
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
										stock images related to your business. You will be able to modify your answers
										in this questionnaire until you submit it. Don't worry - we will ask you if
										you're sure first!
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
										Please leave this question blank if you don’t want us to display a street
										address.
									</FormSettingExplanation>
									<FormTextArea name="address" id="address" />
								</FormFieldset>
								<FormFieldset>
									<FormLabel htmlFor="slogan">
										Does your business have a tagline or slogan?
									</FormLabel>
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
									<FilePicker multiple accept="image/*" onPick={ empty }>
										<Button>Select Files</Button>
									</FilePicker>
								</FormFieldset>
								<FormFieldset>
									<FormLabel htmlFor="slogan">
										Do you want a blog included with your new site?
									</FormLabel>
									<FormLabel>
										<FormRadio value="yes" checked={ true } onChange={ empty } label="Yes" />
									</FormLabel>

									<FormLabel>
										<FormRadio value="no" checked={ false } onChange={ empty } label="No" />
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
											onChange={ empty }
											label="Professional Services"
										/>
									</FormLabel>
									<FormLabel>
										<FormRadio
											value="local-service"
											checked={ false }
											onChange={ empty }
											label="Local Service"
										/>
									</FormLabel>
									<FormLabel>
										<FormRadio
											value="creative-arts"
											checked={ false }
											onChange={ empty }
											label="Creative Arts"
										/>
									</FormLabel>
									<FormLabel>
										<FormRadio
											value="restaurants"
											checked={ false }
											onChange={ empty }
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
									<DemoTile
										id={ 'local-services-1' }
										name="Local Services [1]"
										image={ photography }
										onShowPreview={ () => setSitePreviewVisibility( true ) }
									/>
									<DemoTile
										id={ 'local-services-2' }
										name="Local Services [2]"
										image={ musician }
										onShowPreview={ () => setSitePreviewVisibility( true ) }
									/>
									<DemoTile
										id={ 'local-services-3' }
										name="Local Services [3]"
										image={ phsych }
										onShowPreview={ () => setSitePreviewVisibility( true ) }
									/>
									<DemoTile
										id={ 'local-services-4' }
										name="Local Services [4]"
										image={ dietician }
										selectedDesign={ 'local-services-4' }
										onShowPreview={ () => setSitePreviewVisibility( true ) }
									/>
								</VerticalsGrid>
							</Tile>
						</Slider>
					</Container>
				</ActionPanelBody>
			</ActionPanel>
		</Fragment>
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
