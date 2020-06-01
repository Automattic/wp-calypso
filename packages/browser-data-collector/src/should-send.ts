/**
 * Determines if a report should be sent by the transport.
 *
 * This function main use is to implement sampling based on the report characteristics.
 * Example:
 *
 * // Send only 1 out of 4 reports, except for "home" (send 1 out of 2) and
 * // "plans" (send all)
 *
 * if (report.id=="home") return Math.random() > 0.5;
 * if (report.id=="plans") return true;
 * return Math.random() > 0.25
 *
 *
 * This is left as a function (and not a static config object, for example) so we have
 * the flexibility to check data from any collectors to make the sampling decission
 * (contrived example: sample reports to 10% by default, but use 20% if they are an atomic site
 * or from Firefox).
 *
 * @param _report Report to inspect
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const shouldSend = ( _report: Report ): boolean => {
	return true;
};
