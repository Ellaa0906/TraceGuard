export function resolveHolderRole(address, batch) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "UNKNOWN";
  
  if (batch.manufacturer && address.toLowerCase() === batch.manufacturer.toLowerCase()) {
    return "MANUFACTURER";
  }
  if (batch.distributor && address.toLowerCase() === batch.distributor.toLowerCase()) {
    return "DISTRIBUTOR";
  }
  if (batch.retailer && address.toLowerCase() === batch.retailer.toLowerCase()) {
    return "RETAILER";
  }
  return "OTHER HOLDER";
}

export function formatAddress(addr) {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}