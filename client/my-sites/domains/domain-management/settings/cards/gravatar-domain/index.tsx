import { useTranslate } from 'i18n-calypso';

const GravatarDomainCard = () => {
	const translate = useTranslate();

	return (
		<div>
			<div>
				<p>
					{ translate(
						'This domain is used as a custom domain for your {{a}}Gravatar profile{{/a}}.',
						{
							components: {
								a: <a href="https://gravatar.com/profile" rel="noopener noreferrer" />,
							},
						}
					) }
				</p>
			</div>
		</div>
	);
};

export default GravatarDomainCard;
