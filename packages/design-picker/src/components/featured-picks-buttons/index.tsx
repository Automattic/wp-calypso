import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { isBlankCanvasDesign } from '../..';
import type { Design } from '../../types';
import './style.scss';

interface Props {
	className?: string;
	designs: Design[];
	onSelect: ( design: Design ) => void;
}

const FeaturedPicksButtons: React.FC< Props > = ( { className, designs, onSelect } ) => {
	const { __ } = useI18n();

	if ( ! designs.length ) {
		return null;
	}

	return (
		<div className={ clsx( 'featured-picks-buttons', className ) }>
			{ designs.map( ( design ) => (
				<Button
					key={ design.slug }
					className={ clsx( 'featured-picks-buttons__button', className ) }
					variant="secondary"
					onClick={ () => onSelect( design ) }
				>
					{ isBlankCanvasDesign( design )
						? __( 'Use a blank theme' )
						: /* translators: %s is the title of design */
						  sprintf( __( 'Use %s' ), design.title ) }
				</Button>
			) ) }
		</div>
	);
};

export default FeaturedPicksButtons;
