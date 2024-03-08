import InlineSupportLink from 'calypso/components/inline-support-link';

type EarnSupportButtonProps = {
	supportContext: string;
};

const EarnSupportButton = ( { supportContext }: EarnSupportButtonProps ) => (
	<div className="action-panel__cta">
		<InlineSupportLink supportContext={ supportContext } showIcon={ false } className="button" />
	</div>
);

export default EarnSupportButton;
