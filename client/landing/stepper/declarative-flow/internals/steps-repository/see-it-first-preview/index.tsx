import { getUrlParts } from '@automattic/calypso-url';
import { SiteThumbnail, Spinner } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { __experimentalVStack as VStack, Icon } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { addSchemeIfMissing } from 'calypso/lib/url';
import { LONG_SCREENSHOT } from './screenshot';
import type { Step as StepType } from '../../types';

import './style.scss';

export type SeeItFirstPreviewSubmits = { action: 'keep' } | { action: 'unavailable' };

const SeeItFirstPreview: StepType< { submits: SeeItFirstPreviewSubmits } > =
	function SeeItFirstPreview( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const from = searchParams.get( 'from' )?.trim();
		const sourceUrl = from ? addSchemeIfMissing( from, 'https' ) : '';
		const sourceHost = getUrlParts( sourceUrl ).hostname;

		const submit = useEffectEvent( ( result: SeeItFirstPreviewSubmits ) =>
			navigation.submit?.( result )
		);

		useEffect( () => {
			if ( ! sourceUrl ) {
				submit( { action: 'unavailable' } );
			}
		}, [ sourceUrl ] );

		const perks = [
			__( 'Free domain for your first year' ),
			__( 'Unlimited traffic and speedy load times' ),
			__( 'Robust security, and uptime you can count on' ),
		];

		// The flow asked mShots for it when the address was confirmed. Asking again here would
		// restart the capture and show its placeholder.
		const screenshot = LONG_SCREENSHOT;

		return (
			<>
				<DocumentHead title={ __( 'Your site' ) } />
				<Step.TwoColumnLayout
					className="see-it-first-preview"
					firstColumnWidth={ 6 }
					secondColumnWidth={ 6 }
					columns={ 12 }
					noInlinePadding
					isFullWidth
				>
					<Step.CenteredColumnLayout
						verticalAlign="center"
						columnWidth={ 4 }
						topBar={ <Step.TopBar /> }
					>
						<VStack className="see-it-first-preview__pitch" spacing={ 6 }>
							<Step.Heading
								align="left"
								text={ __( 'Your site, on WordPress.com' ) }
								subText={ sprintf(
									// translators: %s is the address of the customer's current site, e.g. example.com.
									__(
										'This is %s as it looks today. Continue, and we’ll move your pages, images and design to WordPress.com.'
									),
									sourceHost
								) }
							/>
							<ul className="see-it-first-preview__perks">
								{ perks.map( ( perk ) => (
									<li key={ perk }>
										<Icon icon={ check } size={ 20 } />
										{ perk }
									</li>
								) ) }
							</ul>
							<VStack spacing={ 3 }>
								<Step.PrimaryButton onClick={ () => submit( { action: 'keep' } ) }>
									{ __( 'Continue' ) }
								</Step.PrimaryButton>
								<p className="see-it-first-preview__note">
									{ __( 'We start moving your site as soon as you check out.' ) }
								</p>
							</VStack>
						</VStack>
					</Step.CenteredColumnLayout>
					<div className="see-it-first-preview__screenshot">
						{ sourceUrl && (
							<SiteThumbnail
								mShotsUrl={ sourceUrl }
								alt={ sprintf(
									// translators: %s is the address of the customer's current site, e.g. example.com.
									__( 'Preview of %s' ),
									sourceHost
								) }
								mshotsOption={ screenshot }
								width={ screenshot.w }
								height={ screenshot.h }
							>
								<Spinner size={ 50 } />
							</SiteThumbnail>
						) }
					</div>
				</Step.TwoColumnLayout>
			</>
		);
	};

export default SeeItFirstPreview;
