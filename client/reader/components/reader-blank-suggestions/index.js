import { localize } from 'i18n-calypso';

import './style.scss';

function BlankSuggestions( props ) {
	return (
		<div className="reader-blank-suggestions">
			{ props.suggestions && props.suggestions.length > 0 && (
				<>
					{ props.translate( 'Suggestions: {{suggestions /}}, {{tagsLink /}}', {
						components: {
							suggestions: props.suggestions,
							tagsLink: (
								<a href="/tags" onClick={ props.trackTagsPageLinkClick }>
									{ props.translate( 'See all tags' ) }
								</a>
							),
						},
					} ) }
				</>
			) }
			&nbsp;
		</div>
	);
}

export default localize( BlankSuggestions );
