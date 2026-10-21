import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
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
					aria-label={ sprintf(
						/* translators: %s is the title of the previous lesson */
						__( 'Previous lesson: %s', __i18n_text_domain__ ),
						decodeEntities( previous.title )
					) }
				>
					← { __( 'Previous lesson', __i18n_text_domain__ ) }
				</Link>
			) }
			{ next?.url && (
				<Link
					to={ `?link=${ encodeURIComponent( next.url ) }` }
					className="help-center-article-lesson-navigation__link help-center-article-lesson-navigation__link--next"
					aria-label={ sprintf(
						/* translators: %s is the title of the next lesson */
						__( 'Next lesson: %s', __i18n_text_domain__ ),
						decodeEntities( next.title )
					) }
				>
					{ __( 'Next lesson', __i18n_text_domain__ ) } →
				</Link>
			) }
		</nav>
	);
};
