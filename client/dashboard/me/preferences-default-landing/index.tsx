import { userPreferencesMutation, rawUserPreferencesQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import clsx from 'clsx';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';

import './style.scss';

type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

// Inline SVG illustrations - compact versions
const AllSitesIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="280" height="180" rx="4" fill="#F6F7F7" />
		<rect y="0" width="280" height="20" fill="#DCDCDE" />
		<rect x="12" y="28" width="32" height="8" rx="2" fill="#1E1E1E" />
		<rect x="12" y="42" width="80" height="14" rx="3" fill="#DCDCDE" />
		<g>
			<rect
				x="12"
				y="64"
				width="80"
				height="104"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="16" y="68" width="72" height="48" rx="2" fill="#C3C4C7" />
			<rect x="24" y="84" width="56" height="16" rx="2" fill="#A7AAAD" />
			<rect x="16" y="124" width="50" height="6" rx="1" fill="#1E1E1E" />
			<rect x="16" y="134" width="40" height="4" rx="1" fill="#A7AAAD" />
		</g>
		<g>
			<rect
				x="100"
				y="64"
				width="80"
				height="104"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="104" y="68" width="72" height="48" rx="2" fill="#E9EFF5" />
			<rect x="112" y="80" width="56" height="10" rx="1" fill="#3858E9" />
			<rect x="112" y="94" width="40" height="10" rx="1" fill="#A7AAAD" />
			<rect x="104" y="124" width="45" height="6" rx="1" fill="#1E1E1E" />
			<rect x="104" y="134" width="55" height="4" rx="1" fill="#A7AAAD" />
		</g>
		<g>
			<rect
				x="188"
				y="64"
				width="80"
				height="104"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="192" y="68" width="72" height="48" rx="2" fill="#F0E6FA" />
			<circle cx="228" cy="92" r="14" fill="#9B59B6" opacity="0.5" />
			<circle cx="244" cy="82" r="10" fill="#E74C8C" opacity="0.5" />
			<rect x="192" y="124" width="55" height="6" rx="1" fill="#1E1E1E" />
			<rect x="192" y="134" width="48" height="4" rx="1" fill="#A7AAAD" />
		</g>
	</svg>
);

const PrimarySiteIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="280" height="180" rx="4" fill="#F6F7F7" />
		<rect y="0" width="280" height="20" fill="#DCDCDE" />
		<rect x="12" y="28" width="70" height="8" rx="2" fill="#1E1E1E" />
		<rect x="12" y="40" width="100" height="5" rx="1" fill="#A7AAAD" />
		<rect x="12" y="52" width="64" height="80" rx="4" fill="#0A4B78" />
		<rect x="18" y="72" width="52" height="8" rx="1" fill="white" opacity="0.9" />
		<rect x="18" y="84" width="36" height="4" rx="1" fill="white" opacity="0.6" />
		<rect x="18" y="108" width="20" height="8" rx="2" fill="#3858E9" />
		<rect x="42" y="108" width="20" height="8" rx="2" fill="#50575E" />
		<g>
			<rect
				x="84"
				y="52"
				width="56"
				height="36"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="96" cy="64" r="5" fill="#00A32A" opacity="0.2" />
			<path
				d="M93.5 64L95.5 66L98.5 63"
				stroke="#00A32A"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<rect x="90" y="74" width="32" height="4" rx="1" fill="#A7AAAD" />
			<rect x="90" y="80" width="24" height="5" rx="1" fill="#1E1E1E" />
		</g>
		<g>
			<rect
				x="148"
				y="52"
				width="56"
				height="36"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="154" y="60" width="14" height="14" rx="2" fill="#E9EFF5" />
			<rect x="158" y="66" width="6" height="4" rx="1" fill="#3858E9" />
			<rect x="154" y="80" width="36" height="5" rx="1" fill="#1E1E1E" />
		</g>
		<g>
			<rect
				x="212"
				y="52"
				width="56"
				height="36"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="224" cy="64" r="5" fill="#3858E9" opacity="0.2" />
			<rect x="221" y="62" width="6" height="4" rx="1" fill="#3858E9" />
			<rect x="218" y="74" width="32" height="4" rx="1" fill="#A7AAAD" />
			<rect x="218" y="80" width="24" height="5" rx="1" fill="#1E1E1E" />
		</g>
		<g>
			<rect
				x="84"
				y="96"
				width="56"
				height="36"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="96" cy="108" r="5" fill="#DCDCDE" />
			<rect x="94" y="106" width="4" height="4" rx="1" fill="#50575E" />
			<rect x="90" y="118" width="36" height="4" rx="1" fill="#A7AAAD" />
			<rect x="90" y="124" width="28" height="5" rx="1" fill="#1E1E1E" />
		</g>
		<g>
			<rect
				x="148"
				y="96"
				width="56"
				height="36"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="160" cy="108" r="5" fill="#00A32A" opacity="0.2" />
			<path
				d="M157.5 108L159.5 110L162.5 107"
				stroke="#00A32A"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<rect x="154" y="118" width="40" height="4" rx="1" fill="#A7AAAD" />
			<rect x="154" y="124" width="32" height="5" rx="1" fill="#1E1E1E" />
		</g>
		<g>
			<rect
				x="212"
				y="96"
				width="56"
				height="36"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="218" y="106" width="40" height="4" rx="2" fill="#DCDCDE" />
			<rect x="218" y="106" width="14" height="4" rx="2" fill="#3858E9" />
			<rect x="218" y="116" width="28" height="4" rx="1" fill="#A7AAAD" />
			<rect x="218" y="124" width="20" height="5" rx="1" fill="#1E1E1E" />
		</g>
	</svg>
);

const ReaderIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="280" height="180" rx="4" fill="#F6F7F7" />
		<rect y="0" width="280" height="20" fill="#DCDCDE" />
		<rect x="0" y="20" width="56" height="160" fill="#FAFAFA" />
		<rect x="8" y="32" width="40" height="6" rx="1" fill="#3858E9" />
		<rect x="8" y="44" width="32" height="5" rx="1" fill="#A7AAAD" />
		<rect x="8" y="54" width="28" height="5" rx="1" fill="#A7AAAD" />
		<rect x="8" y="64" width="24" height="5" rx="1" fill="#A7AAAD" />
		<rect x="8" y="74" width="30" height="5" rx="1" fill="#A7AAAD" />
		<rect x="64" y="28" width="44" height="8" rx="2" fill="#1E1E1E" />
		<rect x="64" y="40" width="72" height="5" rx="1" fill="#A7AAAD" />
		<g>
			<rect
				x="64"
				y="52"
				width="204"
				height="56"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="84" cy="72" r="12" fill="#DCDCDE" />
			<circle cx="84" cy="70" r="5" fill="#A7AAAD" />
			<ellipse cx="84" cy="79" rx="7" ry="4" fill="#A7AAAD" />
			<rect x="104" y="62" width="60" height="6" rx="1" fill="#1E1E1E" />
			<rect x="104" y="72" width="40" height="4" rx="1" fill="#A7AAAD" />
			<rect x="104" y="84" width="140" height="6" rx="1" fill="#1E1E1E" />
			<rect x="104" y="94" width="100" height="4" rx="1" fill="#A7AAAD" />
		</g>
		<g>
			<rect
				x="64"
				y="116"
				width="204"
				height="56"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="84" cy="136" r="12" fill="#E9EFF5" />
			<circle cx="84" cy="134" r="5" fill="#3858E9" />
			<ellipse cx="84" cy="143" rx="7" ry="4" fill="#3858E9" opacity="0.5" />
			<rect x="104" y="126" width="50" height="6" rx="1" fill="#1E1E1E" />
			<rect x="104" y="136" width="36" height="4" rx="1" fill="#A7AAAD" />
			<rect x="104" y="148" width="120" height="6" rx="1" fill="#1E1E1E" />
			<rect x="104" y="158" width="80" height="4" rx="1" fill="#A7AAAD" />
		</g>
	</svg>
);

interface LandingPageOption {
	value: LandingPage;
	title: string;
	description: string;
	illustration: React.ReactNode;
}

interface LandingPageOptionCardProps {
	option: LandingPageOption;
	isSelected: boolean;
	isDisabled: boolean;
	onSelect: ( value: LandingPage ) => void;
}

function LandingPageOptionCard( {
	option,
	isSelected,
	isDisabled,
	onSelect,
}: LandingPageOptionCardProps ) {
	const handleClick = () => {
		if ( ! isDisabled ) {
			onSelect( option.value );
		}
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			handleClick();
		}
	};

	return (
		<div
			className={ clsx( 'landing-page-option-card', {
				'is-selected': isSelected,
				'is-disabled': isDisabled,
			} ) }
			role="radio"
			aria-checked={ isSelected }
			aria-disabled={ isDisabled }
			tabIndex={ isDisabled ? -1 : 0 }
			onClick={ handleClick }
			onKeyDown={ handleKeyDown }
		>
			<div className="landing-page-option-card__illustration">
				{ option.illustration }
				<input
					className="landing-page-option-card__radio"
					type="radio"
					name="landing-page-option"
					value={ option.value }
					checked={ isSelected }
					disabled={ isDisabled }
					onChange={ () => onSelect( option.value ) }
					tabIndex={ -1 }
					aria-label={ option.title }
				/>
			</div>
			<VStack className="landing-page-option-card__content" spacing={ 0 }>
				<Text className="landing-page-option-card__title" weight={ 500 }>
					{ option.title }
				</Text>
				<Text className="landing-page-option-card__description" variant="muted">
					{ option.description }
				</Text>
			</VStack>
		</div>
	);
}

export default function PreferencesDefaultLanding() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: defaultLandingPage } = useSuspenseQuery( {
		...rawUserPreferencesQuery(),
		select: ( preferences ): LandingPage => {
			if ( preferences[ 'sites-landing-page' ]?.useSitesAsLandingPage ) {
				return 'sites';
			}
			if ( preferences[ 'reader-landing-page' ]?.useReaderAsLandingPage ) {
				return 'reader';
			}
			return 'primary-site-dashboard';
		},
	} );

	const { mutateAsync: saveUserPreferences, isPending: isSavingUserPreferences } = useMutation(
		userPreferencesMutation()
	);

	const options: LandingPageOption[] = [
		{
			value: 'sites',
			title: __( 'All Sites' ),
			description: __( 'See a list of all your sites.' ),
			illustration: <AllSitesIllustration />,
		},
		{
			value: 'primary-site-dashboard',
			title: __( 'Primary Site' ),
			description: __( 'Go to your main site.' ),
			illustration: <PrimarySiteIllustration />,
		},
		{
			value: 'reader',
			title: __( 'Reader' ),
			description: __( 'View posts from sites you follow.' ),
			illustration: <ReaderIllustration />,
		},
	];

	const handleSelect = ( value: LandingPage ) => {
		const updatedAt = Date.now();
		saveUserPreferences( {
			'sites-landing-page': {
				useSitesAsLandingPage: value === 'sites',
				updatedAt,
			},
			'reader-landing-page': {
				useReaderAsLandingPage: value === 'reader',
				updatedAt,
			},
		} )
			.then( () => {
				createSuccessNotice( __( 'Default landing page saved.' ), {
					type: 'snackbar',
				} );
			} )
			.catch( () => {
				createErrorNotice( __( 'Failed to save default landing page.' ), {
					type: 'snackbar',
				} );
			} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Default landing page' ) }
						description={ __( 'Choose what you see after logging into WordPress.com' ) }
					/>

					<HStack
						className="landing-page-options"
						spacing={ 0 }
						alignment="stretch"
						role="radiogroup"
						aria-label={ __( 'Default landing page' ) }
					>
						{ options.map( ( option ) => (
							<LandingPageOptionCard
								key={ option.value }
								option={ option }
								isSelected={ defaultLandingPage === option.value }
								isDisabled={ isSavingUserPreferences }
								onSelect={ handleSelect }
							/>
						) ) }
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
