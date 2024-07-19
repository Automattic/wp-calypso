import { Gravatar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

type BylinePreviewProps = {
	isGravatarEnabled?: boolean;
	isAuthorEnabled?: boolean;
	isPostDateEnabled?: boolean;
	displayName: string;
	dateExample: string;
	user?: {
		display_name?: string;
		name?: string;
		avatar_URL?: string;
	} | null;
};

export const BylinePreview = ( {
	isGravatarEnabled,
	isAuthorEnabled,
	isPostDateEnabled,
	user,
	dateExample = 'January 1, 2021',
}: BylinePreviewProps ) => {
	const translate = useTranslate();

	const displayName = user?.display_name || user?.name || '';

	if ( ! isGravatarEnabled && ! isAuthorEnabled && ! isPostDateEnabled ) {
		return (
			<div className="byline-preview">
				<span>
					{ translate( '{{Preview}}Preview:{{/Preview}} {{Empty}}Byline will be empty{{/Empty}}', {
						components: {
							Preview: <span className="byline-preview__label" />,
							Empty: <em />,
						},
					} ) }
				</span>
			</div>
		);
	}
	let Byline = null;
	if ( isAuthorEnabled && isPostDateEnabled ) {
		Byline =
			/* translators: {{Author/}} placeholder is the user display name, {{Date/}} is example date */
			translate( 'By {{Author/}} on {{Date/}}', {
				components: {
					Author: <strong className="byline-preview__author">{ displayName }</strong>,
					Date: <time className="byline-preview__date">{ dateExample }</time>,
				},
			} );
	} else if ( isAuthorEnabled && ! isPostDateEnabled ) {
		Byline =
			/* translators: {{Author/}} placeholder is the user display name */
			translate( 'By {{Author/}}', {
				args: [ displayName ],
				components: {
					Author: <strong className="byline-preview__author">{ displayName }</strong>,
				},
			} );
	} else if ( ! isAuthorEnabled && isPostDateEnabled ) {
		Byline = <time className="byline-preview__date">{ dateExample }</time>;
	}

	return (
		<>
			<div className="byline-preview">
				<span className="byline-preview__label">{ translate( 'Preview:' ) }</span>
				{ isGravatarEnabled && (
					<Gravatar className="byline-preview__gravatar" user={ user } size={ 32 } />
				) }
				<span>{ Byline }</span>
			</div>
		</>
	);
};
