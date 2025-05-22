import useIsBrowser from '@docusaurus/useIsBrowser';
import { Card, CardBody, CardMedia } from '@wordpress/components';
import { useId } from 'react';
import defaultImage from './default.png';
import styles from './style.module.scss';

/**
 * A card that links to a page.
 */
export const LinkCard = ( {
	className,
	href,
	label,
	description,
	image = defaultImage,
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
		<Card className={ className }>
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
				<span id={ labelId } className={ styles[ 'link-card__label' ] }>
					{ label }
				</span>
				<span id={ descriptionId } className={ styles[ 'link-card__description' ] }>
					{ description }
				</span>
			</CardBody>
		</Card>
	);
};
