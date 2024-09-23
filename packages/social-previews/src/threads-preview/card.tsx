import clsx from 'clsx';
import { baseDomain } from '../helpers';
import { threadsTitle } from './helpers';
import { ThreadsCardProps } from './types';

export const Card: React.FC< ThreadsCardProps > = ( { image, title, url } ) => {
	const cardClassNames = clsx( {
		'threads-preview__card-has-image': !! image,
	} );

	return (
		<div className="threads-preview__card">
			<div className={ cardClassNames }>
				{ image && <img className="threads-preview__card-image" src={ image } alt="" /> }
				<div className="threads-preview__card-body">
					<div className="threads-preview__card-url">{ baseDomain( url || '' ) }</div>
					<div className="threads-preview__card-title">{ threadsTitle( title ) }</div>
				</div>
			</div>
		</div>
	);
};
