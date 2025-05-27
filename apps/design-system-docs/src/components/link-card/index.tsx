import useIsBrowser from '@docusaurus/useIsBrowser';
import { Card, CardBody, CardMedia } from '@wordpress/components';
import clsx from 'clsx';
import { useId } from 'react';
import styles from './style.module.scss';

// TODO: Replace with actual image URL.
const DEFAULT_IMAGE =
	'https://raw.githubusercontent.com/Automattic/wp-calypso/2e973a7d95304c88ecd795e903ba28f47a6e714e/apps/design-system-docs/docs/components/ds/form-controls/button/button.png';

/**
 * A card that links to a page.
 */
export const LinkCard = ( {
	className,
	href,
	label,
	description,
	image = DEFAULT_IMAGE,
}: {
	className?: string;
	href: string;
	label: string;
	description?: string;
	/**
	 * Optional image to display in the card.
	 * Should only be decorative, as it will be hidden from screen readers.
	 */
	image?: string;
} ) => {
	const descriptionId = useId();
	const labelId = useId();

	const isBrowser = useIsBrowser();

	// Just for SSG (SEO). Can be removed when `Card` is forked and converted away from Emotion.
	if ( ! isBrowser ) {
		return (
			<>
				<a href={ href } aria-describedby={ descriptionId }>
					{ label }
				</a>
				<p id={ descriptionId }>{ description }</p>
			</>
		);
	}

	return (
		<Card className={ clsx( styles[ 'link-card' ], className ) }>
			<a
				href={ href }
				aria-describedby={ descriptionId }
				aria-labelledby={ labelId }
				className={ styles[ 'link-card__click-target' ] }
			></a>
			<CardMedia className={ styles[ 'link-card__image' ] }>
				<img src={ image } alt="" />
			</CardMedia>
			<CardBody>
				<span id={ labelId } className={ styles[ 'link-card__label' ] } aria-hidden="true">
					{ label }
				</span>
				<span id={ descriptionId } className={ styles[ 'link-card__description' ] }>
					{ description }
				</span>
			</CardBody>
		</Card>
	);
};
