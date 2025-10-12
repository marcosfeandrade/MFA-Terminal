# 🖥️ MFA Terminal - Terminal Layout Manager

A powerful extension for VS Code and Cursor that allows you to save and load terminal layouts with support for **splits** (side-by-side terminals), boosting your development productivity.

## ✨ Features

- **💾 Save Layouts**: Capture your current terminal layout and save it as a reusable profile
- **🔲 Split Support**: Organize terminals in groups - terminals in the same group appear side by side (split)
- **📂 Load Layouts**: Quickly restore your favorite terminal layouts with the exact group structure
- **✏️ Create Layouts**: Create custom layouts from scratch with a guided interface
- **🎯 Flexible Organization**: Choose how to organize your terminals:
  - Each terminal separate
  - All split together
  - Custom manual organization
- **📝 Edit Layouts**: Modify name, description, or update existing layout structures
- **🗑️ Delete Layouts**: Remove layouts that are no longer needed
- **📋 List Layouts**: View all your saved layouts in one place

---

## 🚀 How to Use

### 1. Save a Layout with Splits

1. Open the terminals you regularly use
2. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Type and select: `MFA Terminal: Save Current Layout`
4. Choose how to organize the terminals:
   - **Each terminal in its own group**: Separate terminals
   - **All split in one group**: All side by side
   - **Manually organize**: Choose which terminals stay together
5. Give the layout a name (e.g., "Full Stack Development")
6. Add an optional description
7. Done! Your layout with split structure has been saved ✅

### 2. Load a Layout

1. Open the command palette
2. Type and select: `MFA Terminal: Load Layout`
3. Choose the desired layout from the list
4. Choose whether to keep or close existing terminals
5. Your terminals will be created automatically with the split structure! 🎉
   - Terminals in the same group will appear side by side (split)
   - Different groups will appear in separate panels

### 3. Create a Custom Layout

1. Open the command palette
2. Type and select: `MFA Terminal: Create New Layout`
3. Follow the interactive wizard:
   - Enter the layout name
   - Add a description (optional)
   - Configure each terminal:
     - Terminal name
     - Command to execute (optional)
     - Working directory (optional)
   - Add as many terminals as you want
   - Choose how to organize terminals in groups

### 4. Manage Layouts

Use the command `MFA Terminal: List Layouts` to:
- See all your layouts
- Load a layout
- Edit an existing layout
- Delete layouts

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `MFA Terminal: Save Current Layout` | Saves the current terminal layout as a new layout |
| `MFA Terminal: Load Layout` | Loads and applies a saved layout |
| `MFA Terminal: List Layouts` | Displays all layouts with management options |
| `MFA Terminal: Create New Layout` | Creates a custom layout from scratch |
| `MFA Terminal: Edit Layout` | Edits name, description, or layout structure |
| `MFA Terminal: Delete Layout` | Removes a layout |

---

## 💡 Use Cases

### Full Stack Development
Create a layout with 2 groups:
- **Group 1 (split)**: Backend + Frontend side by side
- **Group 2**: Database separate
- **Group 3**: Terminal for tests

**Result**: Backend and Frontend side by side, while Database and Tests are in separate panels.

### Microservices Development
Configure layouts with service groups:
- **Group 1 (split)**: Auth + Users + Payments side by side
- **Group 2**: API Gateway separate

**Result**: All main microservices side by side, with gateway in a separate panel.

### Monorepo Projects
Organize terminals by package:
- Main workspace
- Package 1
- Package 2
- Shared scripts

---

## ⚙️ Layout Configuration

Each terminal in a layout can have:

- **Name**: Terminal identifier
- **Command**: Command executed automatically when creating the terminal
- **Directory**: Folder where the terminal will open
  - ✅ Relative paths: `./src`, `./backend/api`
  - ✅ Absolute paths: `C:\projects\backend`, `/home/user/project`
  - ⚠️ Relative paths are resolved relative to the current workspace
  - ⚠️ The directory must exist, otherwise the terminal uses the default directory

### 📖 Path Usage

#### Relative Paths

When you specify a relative path, it is resolved **relative to the current workspace**:

```
✅ Correct:
./src              → workspace/src
./backend/api      → workspace/backend/api
subfolder          → workspace/subfolder

❌ Avoid:
../other-project   → May not work as expected
```

#### Absolute Paths

You can use absolute paths directly:

```
Windows:
C:\Users\marco\project\backend
D:\development\frontend

Linux/Mac:
/home/user/project/backend
/Users/user/project/frontend
```

#### ⚠️ Important

- **Workspace required**: To use relative paths, you MUST have a workspace open
- **Directory must exist**: If the directory doesn't exist, the terminal will be created in the default directory
- **No validation at creation time**: When creating a layout manually, paths are not validated. Validation only happens when applying the layout

---

## 📝 Practical Examples

### Example 1: Monorepo Project

Structure:
```
my-project/
├── frontend/
├── backend/
└── shared/
```

Layout "Dev Full Stack":
```
Terminal 1: "Frontend"
  Command: npm run dev
  Directory: ./frontend

Terminal 2: "Backend"
  Command: npm start
  Directory: ./backend

Terminal 3: "Root"
  Command: 
  Directory: (leave empty to use workspace root)
```

### Example 2: Microservices

Structure:
```
microservices/
├── auth-service/
├── user-service/
├── payment-service/
└── gateway/
```

Layout "All Services":
```
Terminal 1: "Auth"
  Command: npm run dev
  Directory: ./auth-service

Terminal 2: "Users"
  Command: npm run dev
  Directory: ./user-service

Terminal 3: "Payments"
  Command: npm run dev
  Directory: ./payment-service

Terminal 4: "Gateway"
  Command: npm run dev
  Directory: ./gateway
```

### Example 3: Docker + Development

Layout "Docker Dev":
```
Terminal 1: "Docker"
  Command: docker-compose up
  Directory: (project root)

Terminal 2: "Frontend Dev"
  Command: npm run dev
  Directory: ./app

Terminal 3: "Logs"
  Command: docker-compose logs -f
  Directory: (project root)
```

---

## 📖 How to Save Layout with Splits

### ⚠️ IMPORTANT - Read Before Using

The VS Code API **DOES NOT** provide information about which terminals are split. Therefore, when you save a layout, **you need to manually inform** which terminals were side by side.

### 🎯 Your Scenario

You have:
```
[s1 | s2]  ← split (side by side)
[t1]       ← separate
```

### 📝 Correct Step by Step

#### 1. Save the Layout

Execute: `MFA Terminal: Save Current Layout`

#### 2. Enter the Layout Name

- You'll see: `Saving terminals: s1, s2, t1 | Enter layout name`
- Type: "My Layout" (or any name)
- Press Enter

#### 3. ⚠️ CRUCIAL STEP - Define Split Structure

Now the extension will ask **HOW THESE TERMINALS WERE ORGANIZED**:

**Option A: "Manually organize splits" ← CHOOSE THIS**

1. **Group 1** - Select the terminals that were SIDE BY SIDE:
   - Click on `s1`
   - Hold `Ctrl` and click on `s2`
   - Press Enter
   
2. **Continue**: Choose "Finish (create individual groups for the rest)"
   - This will create `t1` separately automatically

**Final Result:**
```
Group 1: s1, s2  → Will be recreated side by side
Group 2: t1      → Will be recreated separate
```

#### 4. Add Description (optional)

- Type something like: "Layout with s1 and s2 split"
- Or leave blank

#### 5. Layout Saved! ✅

Now when you load the layout, it will recreate:
```
[s1 | s2]  ← side by side
[t1]       ← separate
```

### 💡 Organization Tips

#### If your terminals are like this:
```
[s1 | s2]
[t1]
```
**Choose**: "Manually organize"
- Group 1: Select s1 and s2
- Group 2: t1 (automatic)

#### If your terminals are like this:
```
[s1]
[s2]
[t1]
```
**Choose**: "Each terminal separate"

#### If your terminals are like this:
```
[s1 | s2 | t1]
```
**Choose**: "All split (side by side)"

### ❓ Why Is This Necessary?

VS Code doesn't provide an API to automatically detect which terminals are split. The only way is for you to manually inform how they were organized.

Think of it as: **"I capture the NAMES, you define the STRUCTURE"**

---

## 🛠️ Troubleshooting

### Error: "Directory does not exist"

**Cause**: The specified path doesn't point to a valid directory

**Solution**:
1. Check if the directory really exists in your workspace
2. Make sure you're using the correct path (relative or absolute)
3. Open the correct workspace in VS Code
4. If necessary, edit the layout and fix the path

### Error: "Cannot resolve relative paths"

**Cause**: No workspace is open

**Solution**:
1. Open a folder as workspace (File > Open Folder)
2. Or use absolute paths instead of relative

### Terminal opens in wrong directory

**Cause**: Current workspace is different from expected

**Solution**:
1. Check which workspace is open
2. Edit the layout and update the paths
3. Consider using absolute paths if working with multiple workspaces

### Terminals don't appear split

**Cause**: The layout doesn't have multiple terminals in the same group

**Solution**:
1. Check if the layout has multiple terminals in the same group
2. Edit the layout and reorganize the groups
3. Reload the VS Code window (`Developer: Reload Window`)

---

## 💡 Tips and Best Practices

### 1. Name terminals clearly
```
✅ Good: "Backend API", "Frontend React", "Database"
❌ Bad: "Terminal 1", "Test", "asdf"
```

### 2. Use descriptions in layouts
```
✅ Good: "Development environment with React frontend, Node.js backend and PostgreSQL database"
❌ Bad: "dev"
```

### 3. Group layouts by context
```
✅ Organize like this:
- "Dev Full Stack"
- "Dev Frontend Only"
- "Dev Backend Only"
- "E2E Tests"
- "Production Deploy"
```

### 4. Include useful commands
```
✅ Useful commands:
- npm run dev
- docker-compose up
- npm test -- --watch
- git status
```

### 5. Avoid interactive commands
```
❌ Avoid:
- npm init
- git commit (without message)
- commands that require user input

✅ Prefer:
- npm run dev
- npm test
- npm run build
```

---

## 🔄 Recommended Workflow

### For New Projects:

1. Set up your development environment
2. Open all necessary terminals
3. Use `MFA Terminal: Save Current Layout`
4. Test by closing all terminals
5. Use `MFA Terminal: Load Layout` to verify

### For Existing Projects:

1. Use `MFA Terminal: Create New Layout`
2. Configure each terminal manually
3. Test by applying the layout
4. Adjust as needed with `MFA Terminal: Edit Layout`

---

## 🧪 Testing Guide

### How to Test Functionality

#### Preparation

1. **Start the extension in debug mode**:
   - Press `F5` in VS Code
   - This will open a new window with the extension active

#### Test 1: Create Layout with Split Terminals

1. **Open command palette**: `Ctrl+Shift+P`
2. **Execute**: `MFA Terminal: Create New Layout`
3. **Add 3 terminals**:
   - Terminal 1: "Frontend" - command: `echo "Frontend"` - dir: `./`
   - Terminal 2: "Backend" - command: `echo "Backend"` - dir: `./`
   - Terminal 3: "Database" - command: `echo "Database"` - dir: `./`
4. **When asked how to organize**, choose: "Manually organize"
5. **Group 1**: Select "Frontend" and "Backend" (Ctrl+Click for multiple selection)
6. **Continue**: Choose "Finish"
7. **Enter name**: "Dev Full Stack"
8. **Add description**: "Frontend and Backend side by side, Database separate"

**Expected Result**: Message: "✅ Layout 'Dev Full Stack' created! 3 terminal(s) in 2 groups."

#### Test 2: Load Layout with Splits

1. **Open command palette**: `Ctrl+Shift+P`
2. **Execute**: `MFA Terminal: Load Layout`
3. **Select**: "Dev Full Stack"
4. **Choose**: "Keep existing terminals" or "Close existing terminals"

**Expected Result**:
- **Group 1**: Frontend and Backend should appear side by side (split)
- **Group 2**: Database should appear in a separate panel
- Message: "✅ Layout 'Dev Full Stack' applied! 3 terminal(s) in 2 groups."

#### Test 3: All Organization Modes

**Mode: Each Terminal Separate**
```
Organization chosen: "Each terminal in its own group"
3 terminals → 3 groups

Visual Result:
[Terminal 1]
[Terminal 2]
[Terminal 3]
```

**Mode: All Split**
```
Organization chosen: "All split in one group"
3 terminals → 1 group

Visual Result:
[Terminal 1 | Terminal 2 | Terminal 3]
```

**Mode: Manual**
```
Custom organization:
- Group 1: Terminal 1 + Terminal 2
- Group 2: Terminal 3

Visual Result:
[Terminal 1 | Terminal 2]
[Terminal 3]
```

### ✅ Test Checklist

- [ ] Create layout with 3 terminals, 2 split and 1 separate
- [ ] Load layout and verify split structure
- [ ] Save current layout with "all split"
- [ ] Save current layout with "all separate"
- [ ] Save current layout with manual organization
- [ ] Edit existing layout and update structure
- [ ] Verify listing shows group information
- [ ] Create layout with only 1 terminal (should create 1 group)
- [ ] Create layout with 5+ terminals and organize manually
- [ ] Delete layout

---

## 📁 Storage

Layouts are saved in VS Code/Cursor global storage, which means:
- ✅ Your layouts are available across all your workspaces
- ✅ Layouts persist between editor restarts
- ✅ You can have as many layouts as you want

---

## 🔧 Requirements

- VS Code version 1.105.0 or higher
- Cursor (any recent version)

---

## 🐛 Known Issues

- The VS Code API doesn't allow automatically capturing the current directory or commands already executed in existing terminals. When saving a layout based on open terminals, you'll need to manually configure commands and directories if you want to include them in the layout.
- The VS Code API doesn't provide information about which terminals are split. You'll need to manually organize groups when saving a layout.

---

## 📝 Roadmap

- [ ] Customizable keyboard shortcuts
- [ ] Export/Import layouts (share with team)
- [ ] Workspace-specific layouts (specific to each project)
- [ ] Support for variables in directory paths (e.g., `${workspaceFolder}/src`)
- [ ] Custom environment variables per terminal
- [ ] Custom icons and colors per terminal
- [ ] Custom themes/colors per layout

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

### Reporting Bugs

When reporting a bug, include:
- What you were trying to do
- What error appeared
- Which workspace was open
- Which command you used
- VS Code/Cursor version

---

## 📄 License

MIT

---

## 👨‍💻 Author

Developed with ❤️ to increase development productivity

---

**Enjoy the extension!** If you found it useful, consider leaving a ⭐ rating!
