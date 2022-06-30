import { englishLocales } from '@automattic/i18n-utils';
import i18n, { localize } from 'i18n-calypso';
import { Component } from 'react';

class UpdatedGravatarString extends Component {
	render() {
		const { translate, locale, gravatarProfileLink } = this.props;
		const stringParts = {
			components: {
				spanLead: <strong className="profile__link-destination-label-lead" />,
				spanExtra: <span className="profile__link-destination-label-extra" />,
				profileLink: <a href={ gravatarProfileLink } target="_blank" rel="noreferrer" />,
				deleteLink: (
					<a href="https://gravatar.com/account/disable/" target="_blank" rel="noreferrer" />
				),
			},
		};
		return englishLocales.includes( locale ) ||
			i18n.hasTranslation(
				'{{spanLead}}Hide my photo and Gravatar profile.{{/spanLead}} {{spanExtra}}This will prevent your {{profileLink}}Gravatar profile{{/profileLink}} and photo from appearing on any site. It may take some time for the changes to take effect. Gravatar profiles can be deleted at {{deleteLink}}Gravatar.com{{/deleteLink}}.{{/spanExtra}}'
			)
			? translate(
					'{{spanLead}}Hide my photo and Gravatar profile.{{/spanLead}} {{spanExtra}}This will prevent your {{profileLink}}Gravatar profile{{/profileLink}} and photo from appearing on any site. It may take some time for the changes to take effect. Gravatar profiles can be deleted at {{deleteLink}}Gravatar.com{{/deleteLink}}.{{/spanExtra}}',
					stringParts
			  )
			: translate(
					'{{spanLead}}Hide my Gravatar profile.{{/spanLead}} {{spanExtra}}This will prevent your {{profileLink}}Gravatar profile{{/profileLink}} and photo from appearing on any site. It may take some time for the changes to take effect. Gravatar profiles can be deleted at {{deleteLink}}Gravatar.com{{/deleteLink}}.{{/spanExtra}}',
					stringParts
			  );
	}
}
export default localize( UpdatedGravatarString );
