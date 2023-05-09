import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function NoResults( props ) {
	const translate = useTranslate();
	const { image, text = translate( 'No results.' ), subtitle } = props;
	return (
		<div className="no-results">
			{ image && <img className="no-results__img" src={ image } alt="" /> }
			{ ! subtitle && <span>{ text }</span> }
			{ subtitle && (
				<div className="no-results__titles">
					<div className="no-results__title">{ text }</div>
					{ subtitle && <div className="no-results__subtitle">{ subtitle }</div> }
				</div>
			) }
		</div>
	);
}
