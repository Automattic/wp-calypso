import {
	Button,
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { Card, CardBody } from '../../components/card';
import Grid from '../../components/grid';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import NewTabLabel from '../components/new-tab-label';
import CertificationCodeField from './certification-code-field';
import { CERTIFICATION_EXAM_URL } from './constants';
import { useCertification } from './use-certification';

/**
 * Leads the Dev tools page, written to the developers who take the exam. The
 * same code sits on the Agency tier page, with every tier's discount.
 */
export default function CertificationDevToolsSection() {
	const { isEligible, code, discount, isPromo, promoLastDay } = useCertification();
	const isSmallViewport = useViewportMatch( 'large', '<' );

	if ( ! isEligible ) {
		return null;
	}

	const facts = [
		__( '120 minutes, online or at a test center' ),
		__( 'Multiple-choice and multiple-response questions' ),
		__( 'Valid for three years once you pass' ),
	];

	return (
		<Card size="large" className="a4a-certification-dev-tools">
			<CardBody>
				<Grid
					templateColumns={ isSmallViewport ? '1fr' : 'minmax( 0, 1fr ) minmax( 0, 1fr )' }
					gap="3xl"
				>
					<VStack spacing={ 4 } alignment="flex-start" justify="flex-start">
						<VStack spacing={ 2 }>
							<HStack alignment="left" wrap>
								<Heading level={ 2 } size={ 20 } weight={ 500 }>
									{ __( 'Advanced Professional WordPress Developer' ) }
								</Heading>
								<Badge intent="draft">{ __( 'Certify' ) }</Badge>
							</HStack>
							<Text weight={ 500 }>{ __( 'Prove what your developers can build' ) }</Text>
						</VStack>
						<Text size={ 15 } style={ { textWrap: 'balance' } }>
							{ __(
								'Showcase your expertise in building secure, scalable, and high-performance WordPress solutions. Every developer on your team can take the exam at your agency’s discount.'
							) }
						</Text>
						<VStack
							as="ul"
							role="list"
							spacing={ 1 }
							style={ { margin: 0, padding: 0, listStyle: 'none' } }
						>
							{ facts.map( ( fact ) => (
								<HStack as="li" key={ fact } alignment="topLeft" spacing={ 1 }>
									<Icon
										icon={ check }
										size={ 24 }
										style={ { flexShrink: 0, fill: 'var(--wp-admin-theme-color)' } }
									/>
									<Text size={ 15 } lineHeight="24px">
										{ fact }
									</Text>
								</HStack>
							) ) }
						</VStack>
					</VStack>
					<VStack spacing={ 4 } alignment="flex-start" justify="flex-start">
						<VStack spacing={ 2 } alignment="flex-start">
							<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
								{ __( 'Your agency’s discount' ) }
							</Text>
							<HStack spacing={ 3 } justify="flex-start" alignment="center" wrap>
								<Heading level={ 3 } size={ 32 } weight={ 500 } lineHeight="40px">
									{ sprintf(
										/* translators: %d is a percentage discount */
										__( '%d%% off' ),
										discount
									) }
								</Heading>
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
						</VStack>
						<div style={ { width: '100%' } }>
							<CertificationCodeField
								code={ code }
								label={ __( 'Discount code' ) }
								help={ __(
									'Enter it when you buy the exam on Webassessor. One use per developer.'
								) }
							/>
						</div>
						<HStack spacing={ 4 } justify="flex-start" wrap>
							<Button
								__next40pxDefaultSize
								variant="primary"
								href={ CERTIFICATION_EXAM_URL }
								target="_blank"
								rel="noreferrer"
							>
								<NewTabLabel>{ __( 'Sign up for the exam' ) }</NewTabLabel>
							</Button>
							<RouterLinkButton
								__next40pxDefaultSize
								variant="tertiary"
								to="/tiers"
								hash="certification"
							>
								{ __( 'See every tier’s discount' ) }
							</RouterLinkButton>
						</HStack>
					</VStack>
				</Grid>
			</CardBody>
		</Card>
	);
}
