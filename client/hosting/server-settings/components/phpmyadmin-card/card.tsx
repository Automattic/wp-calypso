import PhpMyAdminForm from 'calypso/sites/settings/database/form';

type PhpMyAdminCardProps = {
	disabled?: boolean;
};

export default function PhpMyAdminCard( { disabled }: PhpMyAdminCardProps ) {
	return <PhpMyAdminForm disabled={ disabled } />;
}
