import {
	Card,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	Icon,
} from '@wordpress/components';
import { forwardRef } from 'react';
import type { CalloutProps } from './types';
import './styles.scss';

function UnforwardedCallout(
	{
		title,
		icon,
		imageSrc,
		imageAlt,
		description,
		actions,
		headingLevel = 6,
		variant = 'default',
	}: CalloutProps,
	ref: React.ForwardedRef< HTMLElement >
) {
	return (
		<Card ref={ ref } className={ `dashboard-callout is-${ variant }` }>
			<HStack
				className="dashboard-callout__h-container"
				spacing="6"
				alignment="stretch"
				justify="stretch"
				expanded={ false }
			>
				<VStack justify="flex-start" alignment="flex-start" spacing="4">
					{ icon && <Icon icon={ icon } /> }
					<Heading level={ headingLevel } className="dashboard-callout__title">
						{ title }
					</Heading>
					{ description }
					{ actions }
				</VStack>
				{ imageSrc && (
					<VStack justify="stretch" alignment="stretch" className="dashboard-callout__image">
						<img src={ imageSrc } alt={ imageAlt } />
					</VStack>
				) }
			</HStack>
		</Card>
	);
}

/**
 * The Callout component is a visually prominent layout element used to
 * highlight a key feature, message, or promotional content. It typically
 * includes a title, supporting description, image and/or icon, and a
 * single call-to-action (CTA) button or link.
 */
export const Callout = forwardRef( UnforwardedCallout );
