import { invokeADB, InvokeADBOptions, fixDevicePath } from "./setup.ts";

/// https://github.com/Fernthedev/desktop_adb_file_browser/blob/master/lib/utils/adb.dart

export function downloadFile(
  devicePath: string,
  hostPath: string,
  options?: InvokeADBOptions
) {
  return invokeADB(options, "pull", fixDevicePath(devicePath), hostPath);
}

export function uploadFile(
  devicePath: string,
  hostPath: string,
  options?: InvokeADBOptions
) {
  return invokeADB(options, "push", hostPath, fixDevicePath(devicePath));
}

export function mkdir(
  devicePath: string,
  options?: InvokeADBOptions
) {
  return invokeADB(options, "shell", `mkdir -p ${fixDevicePath(devicePath)}`);
}