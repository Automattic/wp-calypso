import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Icon,
} from '@wordpress/components';
import { forwardRef } from 'react';
import { Card } from '../card';
import type { CalloutProps } from './types';
import './styles.scss';

function UnforwardedCallout(
	{
		title,
		titleAs: TitleComponent = Text,
		icon,
		image,
		imageAlt,
		imageVariant = 'default',
		description,
		actions,
		variant = 'default',
	}: CalloutProps,
	ref: React.ForwardedRef< HTMLElement >
) {
	return (
		<Card ref={ ref } className={ `dashboard-callout is-${ variant } is-image-${ imageVariant }` }>
			<HStack
				className="dashboard-callout__h-container"
				spacing="6"
				alignment="stretch"
				justify="stretch"
				expanded={ false }
			>
				<VStack
					className="dashboard-callout__content"
					justify="flex-start"
					alignment="flex-start"
					spacing="4"
				>
					{ icon && <Icon icon={ icon } /> }
					<TitleComponent className="dashboard-callout__title">{ title }</TitleComponent>
					{ description }
					{ actions }
				</VStack>
				{ image && (
					<VStack justify="stretch" alignment="stretch" className="dashboard-callout__image">
						{ typeof image === 'string' ? <img src={ image } alt={ imageAlt } /> : image }
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
