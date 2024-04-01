interface Props {
	scheduleId: string;
	onNavBack?: () => void;
}
export const ScheduleLogs = ( props: Props ) => {
	const { scheduleId } = props;

	return <>Schedule Logs: { scheduleId }</>;
};
