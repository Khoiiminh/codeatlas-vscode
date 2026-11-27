// Contract and protocol versions this extension build was compiled against (FND-03).
//
// They come from the pinned engine artifact @codeatlas/contracts (vendor/README.md). IDE-01 sends
// SUPPORTED_PROTOCOL_VERSIONS in the `initialize` handshake and fails clearly when the engine
// answers UNSUPPORTED_PROTOCOL_VERSION (ADR-0005, ADR-0007). Contract types stay in this adapter
// and are mapped to core types here (ADR-0012 rule 4).

import { CONTRACT_VERSION, PROTOCOL_VERSION, isProtocolCompatible } from "@codeatlas/contracts";

/** Contract bundle version the extension was built against. */
export const BUILT_AGAINST_CONTRACT_VERSION: string = CONTRACT_VERSION;

/** Protocol versions offered in `initialize`, most preferred first. */
export const SUPPORTED_PROTOCOL_VERSIONS: readonly string[] = [PROTOCOL_VERSION];

/** True when the engine's chosen protocol version is one this extension can speak. */
export function isSupportedProtocolVersion(engineVersion: string): boolean {
    return SUPPORTED_PROTOCOL_VERSIONS.some((v) => isProtocolCompatible(v, engineVersion));
}
