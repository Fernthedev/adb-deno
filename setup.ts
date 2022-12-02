import { path, streams, zip } from "./deps.ts";
import { configDir } from "./utils.ts";

const adbDownloadURL =
  "https://dl.google.com/android/repository/platform-tools-latest-";
const archiveName = `${Deno.build.os}.zip`;
const downloadURL = `${adbDownloadURL}${archiveName}`;

export function fixDevicePath(p: string) {
  if (!p.startsWith("/")) p = `/${p}`;

  return `"${p}"`;
}

export interface InvokeADBOptions {
  serial?: string;
  downloadPath?: string;
}

export function defaultADBPath() {
  return path.join(configDir()!, "adb-deno");
}

export function invokeADB(options?: InvokeADBOptions, ...args: string[]) {
  const downloadPath = options?.downloadPath ?? defaultADBPath();
  const adbPath = getADBBinary(downloadPath);

  // We execute the command
  // The function returns details about the spawned process
  if (options?.serial !== undefined) {
    args = ["-s", options?.serial, ...args];
  }

  const process = Deno.run({
    cmd: [adbPath, ...args],
    stdout: "piped",
    stderr: "piped",
  });

  return process;
}

export async function downloadADB(downloadPath?: string | null) {
  downloadPath ??= defaultADBPath();

  // windows/darwin/linux

  const archiveRequest = await fetch(downloadURL);

  if (!archiveRequest.ok)
    throw `Unable to download ${archiveRequest} at ${downloadURL}. ${archiveRequest.status} ${archiveRequest.statusText}`;

  for await (const entry of zip.read(archiveRequest.body!)) {
    const finalPath = path.join(downloadPath, entry.name);

    if (entry.type === "file") {
      const buffer = new streams.Buffer();
      await entry.body.stream().pipeTo(buffer.writable);
      await Deno.writeFile(finalPath, buffer.bytes());
    } else {
      await Deno.mkdir(finalPath);
    }
  }

  return getADBBinary(downloadPath);
}

export function getADBBinary(p: string) {
  let bin = path.join(p, "platform-tools", "adb");
  if (Deno.build.os == "windows") {
    bin = `${bin}.exe`;
  }

  return bin;
}
