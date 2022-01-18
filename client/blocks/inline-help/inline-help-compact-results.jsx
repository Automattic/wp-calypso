import PropTypes from 'prop-types';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import './inline-help-search-results.scss';

function InlineHelpCompactResults( { helpLinks, onClick } ) {
	return (
		<ul className="inline-help__results-list">
			{ helpLinks.map( ( link ) => (
				<li key={ link.link + '#' + link.id } className="inline-help__results-item">
					<a
						href={ link.link }
						title={ decodeEntities( link.description ) }
						onClick={ ( event ) => onClick( event, link ) }
						tabIndex={ -1 }
					>
						{ preventWidows( decodeEntities( link.title ) ) }
					</a>
				</li>
			) ) }
		</ul>
	);
}

InlineHelpCompactResults.propTypes = {
	helpLinks: PropTypes.array.isRequired,
	onClick: PropTypes.func.isRequired,
};

export default InlineHelpCompactResults;
