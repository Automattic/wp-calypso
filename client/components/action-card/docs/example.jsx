import ActionCard from '../index';

ActionCard.displayName = 'ActionCard';

function ActionCardExample( {
	exampleCode = (
		<div>
			<ActionCard
				headerText="This is a header text"
				mainText="This is a description of the action. It gives a bit more detail and explains what we are inviting the user to do."
				buttonText="Call to action!"
				buttonIcon="external"
				buttonPrimary
				buttonHref="https://wordpress.com"
				buttonTarget="_blank"
				buttonOnClick={ null }
			/>
			<ActionCard
				headerText="This one has a disabled button."
				mainText="You can also disable the CTA button if necessary."
				buttonText="Disabled button"
				buttonIcon="external"
				buttonPrimary
				buttonHref="https://wordpress.com"
				buttonOnClick={ null }
				buttonDisabled
			/>
		</div>
	),
} ) {
	return exampleCode;
}

ActionCardExample.displayName = 'ActionCard';

export default ActionCardExample;
