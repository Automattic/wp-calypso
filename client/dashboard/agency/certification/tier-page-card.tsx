import {
	Button,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { code as codeIcon } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { Card, CardBody, CardDivider, CardHeader } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import NewTabLabel from '../components/new-tab-label';
import CertificationCardSkeleton from './certification-card-skeleton';
import CertificationCodeField from './certification-code-field';
import { CERTIFICATION_EXAM_URL } from './constants';
import TierDiscountList from './tier-discount-list';
import { useCertification } from './use-certification';
import { useTrackCertificationView } from './use-track-certification-view';
import type { RecordTracksEvent } from '../tiers/types';

/**
 * The discount is a tier benefit, so it leads the benefit cards on the Agency
 * tier page, with the code and what every tier gets.
 */
export default function CertificationTierPageCard( {
	onCodeCopy,
	recordTracksEvent,
}: {
	onCodeCopy?: () => void;
	recordTracksEvent?: RecordTracksEvent;
} = {} ) {
	const { isEligible, isLoading, code, tierId, discount, isPromo, promoLastDay } =
		useCertification();
	useTrackCertificationView( isEligible, 'agency_tier', recordTracksEvent );
	const isSmallViewport = useViewportMatch( 'large', '<' );
	// Same widths as the benefit cards below it.
	const isMediumViewport = useViewportMatch( 'huge', '<' );
	const width = {
		width: isMediumViewport ? '100%' : '50%',
		minWidth: isMediumViewport ? 'unset' : '600px',
	};

	if ( isLoading ) {
		return (
			<VStack style={ { alignItems: 'center' } }>
				<CertificationCardSkeleton style={ width } />
			</VStack>
		);
	}

	if ( ! isEligible ) {
		return null;
	}

	return (
		<VStack style={ { alignItems: 'center' } }>
			<Card
				id="certification"
				className="a4a-certification-tier-card"
				style={ {
					...width,
					// Links to #certification land below the fixed top bar.
					scrollMarginTop: '64px',
				} }
			>
				<CardHeader isBorderless>
					<SectionHeader title={ __( 'Your developer certification discount' ) } level={ 3 } />
				</CardHeader>
				<CardBody>
					<HStack spacing={ 4 } alignment="flex-start" justify="flex-start">
						{ ! isSmallViewport && (
							<div
								aria-hidden="true"
								style={ {
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
									width: '48px',
									height: '48px',
									borderRadius: '4px',
									background: 'var(--color-gray-100)',
									color: 'var(--color-gray-700)',
								} }
							>
								<Icon icon={ codeIcon } size={ 28 } />
							</div>
						) }
						<VStack spacing={ 4 } alignment="flex-start" style={ { flexGrow: 1 } }>
							<VStack spacing={ 2 }>
								<HStack spacing={ 2 } justify="flex-start" alignment="center" wrap>
									<Text weight={ 500 }>
										{ sprintf(
											/* translators: %d is a percentage discount */
											__( '%d%% off the exam fee' ),
											discount
										) }
									</Text>
									{ isPromo && (
										<Badge intent="stable">
											{ sprintf(
												/* translators: %s is a date, e.g. March 31, 2027 */
												__( 'Doubled until %s' ),
												promoLastDay
											) }
										</Badge>
									) }
								</HStack>
								<Text size={ 12 } variant="muted" style={ { textWrap: 'pretty' } }>
									{ __(
										'Your developers can show clients their expertise in building secure, scalable, and high-performance WordPress solutions with the Advanced Professional WordPress Developer certification.'
									) }
								</Text>
							</VStack>
							<div style={ { width: '100%', maxWidth: '440px' } }>
								<CertificationCodeField
									code={ code }
									source="agency_tier"
									onCopy={ onCodeCopy }
									recordTracksEvent={ recordTracksEvent }
								/>
							</div>
							<Button
								__next40pxDefaultSize
								variant="primary"
								href={ CERTIFICATION_EXAM_URL }
								target="_blank"
								rel="noreferrer"
								onClick={ () =>
									recordTracksEvent?.( 'calypso_a4a_certification_exam_click', {
										source: 'agency_tier',
									} )
								}
							>
								<NewTabLabel>{ __( 'Sign up for the exam' ) }</NewTabLabel>
							</Button>
						</VStack>
					</HStack>
				</CardBody>
				<CardDivider style={ { borderColor: 'var(--color-gray-100)' } } />
				<CardBody>
					<VStack spacing={ 4 } style={ { paddingInlineStart: isSmallViewport ? 0 : '64px' } }>
						<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
							{ __( 'Discount by tier' ) }
						</Text>
						<TierDiscountList currentTierId={ tierId } isPromo={ isPromo } />
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
