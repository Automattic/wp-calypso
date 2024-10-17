import { NextButton } from '@automattic/onboarding';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Button, Card, CardBody, CardFooter, CardHeader, Spinner } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UrlData } from 'calypso/blocks/import/types';
import { isSupportedImporterEngine } from 'calypso/lib/importer/importer-config';
import wp from 'calypso/lib/wp';
import { CredentialsFormData } from '../types';
import { PasswordField } from './password-field';
import { SiteAddressField } from './site-address-field';
import { UsernameField } from './username-field';

interface CredentialsFormProps {
	onSubmit: ( siteInfo?: UrlData | undefined ) => void;
	onSkip: () => void;
}
const FieldsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const FormContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const OptionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const Options = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
`;

const Title = styled.h2`
	font-size: 1.2rem;
	font-weight: 600;
	margin: 0;
`;

const Badge = styled.div`
	background-color: var( --color-success );
	padding: 4px 8px;
	border-radius: 0.5rem;
	color: var( --color-text-inverted );
	width: fit-content;
	font-size: 10px;
	font-weight: 600;
	position: absolute;
	top: -25px;
`;

const TitleContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	position: relative;
	font-weight: 600;
	font-size: 15px;
`;

const Description = styled.div`
	margin-bottom: 1.5rem;
`;

const fadeIn = keyframes`
 0% { opacity: 0; margin-top: 10px; }
 100% { opacity: 1; margin-top: 0; }
`;

const FadeIn = styled.div`
	animation: ${ fadeIn } 0.4s ease-in-out;
	animation-fill-mode: both;
	animation-delay: 0.2s;
`;

const CredentialsFormContent = ( {
	from,
	onComplete,
}: {
	from: string;
	onComplete: () => void;
} ) => {
	const { formState, handleSubmit, control } = useForm< CredentialsFormData >( {
		defaultValues: {
			from_url: from,
		},
	} );

	const { errors, isSubmitting } = formState;
	const submitHandler = async () => {
		onComplete();
	};

	const removeDuplicatedSlashes = ( url: string ) => {
		return url.replace( /([^:]\/)\/+/g, '$1' );
	};

	const startMigrationByCredentials = async () => {
		const app_name = 'wp_migration';
		const app_id = '82c3e0a7-fe41-4f40-9e89-aaa947bd19c8';
		const success_url = window.location.href;
		const reject_url = `${ window.location.href }?error=app_migration_failed`;

		const url = addQueryArgs(
			removeDuplicatedSlashes( `${ from }wp-admin/authorize-application.php` ),
			{
				app_name,
				app_id,
				success_url,
				reject_url,
			}
		);

		alert( url );
		window.location.href = url;
	};

	return (
		<FadeIn>
			<OptionsContainer>
				<Description>
					<Title>Our platform can make your site reach a light speed 🚀</Title>
					<p>
						Now, we need to get access to your site, you can use the following options to provide
						your credentials.
					</p>
				</Description>
				<Options>
					<Card>
						<CardHeader>
							<TitleContainer>
								<Badge>Recommended</Badge>
								<h4>Let us get your credentials automatically</h4>
							</TitleContainer>
						</CardHeader>
						<CardBody>
							<p style={ { minHeight: '148px' } }>
								The WordPress Application Passwords feature allows secure authentication for
								external applications to interact with your site via the API without sharing your
								main login credentials.
							</p>
						</CardBody>
						<CardFooter>
							<NextButton onClick={ startMigrationByCredentials }>
								Make the magic happen!
							</NextButton>
						</CardFooter>
					</Card>
					<form onSubmit={ handleSubmit( submitHandler ) }>
						<Card>
							<CardHeader>
								<TitleContainer>
									<h4>Provide your credentials</h4>
								</TitleContainer>
							</CardHeader>

							<CardBody>
								<FieldsContainer>
									<UsernameField control={ control } errors={ errors } />
									<PasswordField control={ control } errors={ errors } />
								</FieldsContainer>
							</CardBody>

							<CardFooter>
								<NextButton type="submit" isBusy={ isSubmitting }>
									Use this credentials
								</NextButton>
							</CardFooter>
						</Card>
					</form>
				</Options>
			</OptionsContainer>
		</FadeIn>
	);
};

const analyzeUrl = ( domain: string ) => {
	return wp.req.get( {
		path: '/imports/analyze-url?site_url=' + encodeURIComponent( domain ),
		apiNamespace: 'wpcom/v2',
	} );
};

const AnalyzeFormContent = ( { onAnalyzed }: { onAnalyzed: ( siteInfo?: UrlData ) => void } ) => {
	const { formState, handleSubmit, control } = useForm< CredentialsFormData >( {} );
	const { errors, isSubmitting } = formState;
	const [ siteInfo, setSiteInfo ] = useState< UrlData | null >( null );

	const submitHandler = async ( data: CredentialsFormData ) => {
		const siteInfo = await analyzeUrl( data.from_url );
		setSiteInfo( siteInfo );
	};

	useEffect( () => {
		onAnalyzed( siteInfo );
	}, [ siteInfo, onAnalyzed ] );

	return (
		<form onSubmit={ handleSubmit( submitHandler ) }>
			<FieldsContainer>
				{ ! siteInfo && (
					<div
						style={ {
							display: 'flex',
							flexDirection: 'column',
							gap: '1rem',
							width: '500px',
							margin: '0 auto',
						} }
					>
						<SiteAddressField control={ control } errors={ errors } />
						<NextButton type="submit" isBusy={ isSubmitting }>
							Continue
						</NextButton>
					</div>
				) }
			</FieldsContainer>
		</form>
	);
};

const Welcome = ( { from, onReset }: { from: string; onReset: () => void } ) => {
	return (
		<Title>
			Welcome,{ ' ' }
			<span
				style={ {
					display: 'block',
					backgroundColor: 'var(--color-accent)',
					padding: '8px 12px',
					borderRadius: '0.5rem',
					color: 'white',
					fontWeight: 'normal',
				} }
			>
				{ from }
			</span>
			<p style={ { fontSize: '12px' } }>
				<Button variant="link" onClick={ onReset }>
					select a different site
				</Button>
			</p>
		</Title>
	);
};

const AlreadyWpcomContent = ( { onComplete }: { onComplete: () => void } ) => {
	return (
		<FadeIn>
			<OptionsContainer>
				<Description>
					<Title>Oh! Looks like you already have a WordPress.com site, that is great!</Title>
					<p>
						Could you please share a bit more about your intentions? We will use this information to
						help you better.
					</p>
				</Description>
				<NextButton onClick={ onComplete }>Okay, let's me share more information</NextButton>
			</OptionsContainer>
		</FadeIn>
	);
};
const NotSupportedContent = ( { onComplete }: { onComplete: () => void } ) => {
	return (
		<FadeIn>
			<OptionsContainer>
				<Description>
					<Title>Oh no! We cant get your site content automatically.</Title>
					<p>Please, talk with our support team to get your site content.</p>
				</Description>
				<NextButton onClick={ onComplete }>Yes, I want to talk with the support team</NextButton>
			</OptionsContainer>
		</FadeIn>
	);
};

const ImportContent = ( { onComplete }: { onComplete: () => void } ) => {
	return (
		<FadeIn>
			<OptionsContainer>
				<Description>
					<Title>Oh no! Looks like your site is not using WordPress.</Title>
					<p>
						You can still migrate your site to WordPress.com using our one-click migration tool.
					</p>
				</Description>
				<NextButton onClick={ onComplete }>Import my site now!</NextButton>
			</OptionsContainer>
		</FadeIn>
	);
};

const fakeCreateTicket = () => {
	return new Promise( ( resolve ) => {
		setTimeout( () => {
			alert( 'Ticket Created' );
			resolve( true );
		}, 2000 );
	} );
};

export const CredentialsForm: FC< CredentialsFormProps > = ( { onSubmit } ) => {
	const [ step, setStep ] = useState<
		'analyze' | 'credentials' | 'import' | 'already_wpcom' | 'not_supported'
	>( 'analyze' );
	const [ from, setFrom ] = useState< string | undefined >( undefined );
	const [ isLoading, setIsLoading ] = useState( false );

	const onAnalyzed = ( siteInfo?: UrlData ) => {
		if ( ! siteInfo ) {
			return setStep( 'analyze' );
		}

		setFrom( siteInfo.url );

		if ( siteInfo.platform_data?.is_wpcom ) {
			return setStep( 'already_wpcom' );
		}

		if ( siteInfo?.platform === 'wordpress' ) {
			return setStep( 'credentials' );
		}

		if ( isSupportedImporterEngine( siteInfo.platform ) ) {
			return setStep( 'import' );
		}

		return setStep( 'not_supported' );
	};

	const onComplete = async () => {
		if ( ! from ) {
			return;
		}

		setIsLoading( true );
		await fakeCreateTicket();
		onSubmit();
	};

	return (
		<FormContent>
			{ isLoading && <Spinner /> }
			{ step === 'analyze' && <AnalyzeFormContent onAnalyzed={ onAnalyzed } /> }
			{ step !== 'analyze' && from && (
				<Welcome from={ from } onReset={ () => setStep( 'analyze' ) } />
			) }
			{ step === 'credentials' && (
				<CredentialsFormContent from={ from! } onComplete={ onComplete } />
			) }
			{ step === 'already_wpcom' && <AlreadyWpcomContent onComplete={ onComplete } /> }
			{ step === 'not_supported' && <NotSupportedContent onComplete={ onComplete } /> }
			{ step === 'import' && <ImportContent onComplete={ onComplete } /> }
		</FormContent>
	);
};
