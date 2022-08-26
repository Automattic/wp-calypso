/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import cx from 'classnames';
import { Pattern } from './types';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	onClick: () => void;
	pattern: Pattern;
};

export function Item( { style, onClick, pattern, className }: Props ) {
	return (
		<div>
			<button
				onClick={ onClick }
				style={ style }
				className={ cx( 'pattern-picker__item', className ) }
			>
				<div className="pattern-picker__item-iframe-wrapper">
					<iframe
						frameBorder="0"
						scrolling="no"
						title={ pattern.name }
						src={ `https://public-api.wordpress.com/wpcom/v2/block-previews/pattern?stylesheet=pub%2Flynx&pattern_id=${ pattern.id }-${ pattern.siteId }` }
					/>
				</div>
			</button>
		</div>
	);
}
