import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { Link } from 'react-router-dom';
import type { LessonNavigation } from '../../types';

declare const __i18n_text_domain__: string;

export const ArticleLessonNavigation = ( {
	lessonNavigation,
}: {
	lessonNavigation: LessonNavigation;
} ) => {
	const { next, previous } = lessonNavigation;

	if ( ! next?.url && ! previous?.url ) {
		return null;
	}

	return (
		<nav className="help-center-article-lesson-navigation">
			{ previous?.url && (
				<Link
					to={ `?link=${ encodeURIComponent( previous.url ) }` }
					className="help-center-article-lesson-navigation__link help-center-article-lesson-navigation__link--previous"
				>
					<span className="help-center-article-lesson-navigation__label">
						← { __( 'Back', __i18n_text_domain__ ) }
					</span>
					<span className="help-center-article-lesson-navigation__title">
						{ decodeEntities( previous.title ) }
					</span>
				</Link>
			) }
			{ next?.url && (
				<Link
					to={ `?link=${ encodeURIComponent( next.url ) }` }
					className="help-center-article-lesson-navigation__link help-center-article-lesson-navigation__link--next"
				>
					<span className="help-center-article-lesson-navigation__label">
						{ __( 'Up next', __i18n_text_domain__ ) } →
					</span>
					<span className="help-center-article-lesson-navigation__title">
						{ decodeEntities( next.title ) }
					</span>
				</Link>
			) }
		</nav>
	);
};
