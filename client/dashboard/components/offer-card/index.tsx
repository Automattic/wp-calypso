import { formatNumber } from '@automattic/number-formatters';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { wpcomLink } from '../../utils/link';
import { Card, CardBody } from '../card';
import abstractDotsSvg from './abstract-dots.svg';
import devSiteBanner from './dev-site-banner.svg';
import './style.scss';

interface OfferCardProps {
	onClick?: () => void;
	layout?: 'inline' | 'stacked';
}

export default function OfferCard( { onClick, layout = 'inline' }: OfferCardProps ) {
	const isSmallViewport = useViewportMatch( 'small', '<' );
	const isStacked = layout === 'stacked';
	const isInlineCollapsed = ! isStacked && isSmallViewport;

	const offerDiscountPercentage = formatNumber( 0.55, {
		numberFormatOptions: { style: 'percent' },
	} );

	const offer = sprintf(
		// translators: %s is a percentage like 55% off
		__( 'Get a free domain and up to %s off' ),
		offerDiscountPercentage
	);

	const description = sprintf(
		// translators: %s is a percentage like 55% off
		__(
			'Save up to %s on annual plans and get a free custom domain for a year. Your next site is just a step away.'
		),
		offerDiscountPercentage
	);

	const Stack = isStacked || isInlineCollapsed ? VStack : HStack;
	const image = isStacked ? devSiteBanner : abstractDotsSvg;
	const href = wpcomLink( '/setup/onboarding' );

	const getStackProps = () => {
		if ( isStacked ) {
			return {};
		}
		if ( isInlineCollapsed ) {
			return { spacing: 2, alignment: 'flex-start' as const };
		}
		return { spacing: 6, alignment: 'center' as const };
	};

	const content = (
		<Stack { ...getStackProps() }>
			{ ( isStacked || ! isSmallViewport ) && (
				<img
					style={ isStacked ? undefined : { width: '64px', flexShrink: 0 } }
					src={ image }
					alt=""
					aria-hidden="true"
				/>
			) }
			<VStack spacing={ 1 }>
				<Text weight={ isStacked ? undefined : 500 } size={ isStacked ? 'title' : undefined }>
					{ offer }
				</Text>
				<Text variant="muted" as="p">
					{ description }
				</Text>
			</VStack>
			<div style={ { flexShrink: 0 } }>
				<Button
					variant="link"
					href={ href }
					onClick={ onClick }
					size="compact"
					__next40pxDefaultSize
				>
					{ __( 'Unlock offer' ) }
				</Button>
			</div>
		</Stack>
	);

	return (
		<Card
			isBorderless
			variant="secondary"
			className={ isStacked ? 'offer-card--stacked' : undefined }
		>
			<CardBody>{ content }</CardBody>
		</Card>
	);
}
