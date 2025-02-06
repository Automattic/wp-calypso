const ForwardIcon = () => (
	<svg width="20" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M1.80001 4.20001C2.20001 4.60001 2.73334 4.80001 3.33334 4.80001H9.53334L7.60001 7.00001L8.33334 7.66667L11.3333 4.33334L8.33334 1.33334L7.66668 2.00001L9.46668 3.80001H3.33334C3.00001 3.80001 2.73334 3.66667 2.46668 3.46667C1.80001 2.80001 1.80001 1.20001 1.80001 0.466673V0.266672H0.800011V0.400006C0.800011 1.40001 0.800011 3.26667 1.80001 4.20001Z"
			fill="#949494"
		/>
	</svg>
);

type Props = {
	target: string;
	showIcon?: boolean;
	title: string;
};
function EmailForwardTarget( { target, showIcon, title }: Props ) {
	return (
		<div title={ title } className="email-plan-mailboxes-list__mailbox-secondary-details">
			{ showIcon && <ForwardIcon /> }
			<span>{ target }</span>
		</div>
	);
}

export default EmailForwardTarget;
