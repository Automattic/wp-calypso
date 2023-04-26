import classnames from 'classnames';
import { baseDomain, firstValid, hardTruncation, shortEnough, stripHtmlTags } from '../helpers';
import { CardProps } from './types';

const DESCRIPTION_LENGTH = 200;

const twitterDescription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export const Card: React.FC< CardProps > = ( { card } ) => {
	if ( ! card ) {
		return null;
	}

	const { description, image, title, type, url } = card;

	const cardClassNames = classnames( `twitter-preview__card-${ type }`, {
		'twitter-preview__card-has-image': !! image,
	} );
	return (
		<div className="twitter-preview__card">
			<div className={ cardClassNames }>
				{ image && <img className="twitter-preview__card-image" src={ image } alt="" /> }
				<div className="twitter-preview__card-body">
					<div className="twitter-preview__card-url">{ baseDomain( url || '' ) }</div>
					<div className="twitter-preview__card-title">{ title }</div>
					<div className="twitter-preview__card-description">
						{ twitterDescription( stripHtmlTags( description ) ) }
					</div>
				</div>
			</div>
		</div>
	);
};
